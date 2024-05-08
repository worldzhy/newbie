import {Controller, Post, Body, Get, Query} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody, ApiResponse} from '@nestjs/swagger';
import {ConfigService} from '@nestjs/config';
import {Prisma} from '@prisma/client';
import {Job, Queue} from 'bull';
import {InjectQueue} from '@nestjs/bull';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {CustomLoggerService} from '@toolkit/logger/logger.service';
import {generateRandomCode} from '@toolkit/utilities/common.util';
import {NoGuard} from '@microservices/account/security/passport/public/public.decorator';
import {
  ContactSearchReqDto,
  ContactSearchPeopleDto,
  AddTaskContactSearchReqDto,
  AddTaskContactSearchResDto,
} from './people-finder.dto';
import {
  SearchEmailThirdResDto,
  SearchEmailContentResDto,
} from '@microservices/people-finder/voila-norbert/volia-norbert.service';

import {
  PeopleFinderService,
  PeopleFinderPlatforms,
  PeopleFinderStatus,
} from '@microservices/people-finder/people-finder.service';
import {PeopleFinderBullJob} from '@microservices/people-finder/constants';
import {PeopleFinderQueue} from '@microservices/people-finder/people-finder.processor';

// type PeopleFinderError = {
//   error: {[x: string]: unknown};
// };
type SearchFilter = {phone: boolean; email: boolean};

@ApiTags('People-finder')
@ApiBearerAuth()
@Controller('people-finder')
export class PeopleFinderController {
  private loggerContext = 'PeopleFinder';
  callBackOrigin: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly peopleFinder: PeopleFinderService,
    private readonly logger: CustomLoggerService,
    private readonly prisma: PrismaService,
    @InjectQueue(PeopleFinderQueue) public queue: Queue
  ) {
    this.callBackOrigin = this.configService.getOrThrow<string>(
      'microservice.peopleFinder.voilanorbert.callbackOrigin'
    );
  }

  getCommonContactSearch = (user: ContactSearchPeopleDto) => {
    return {
      userId: user.userId,
      userSource: user.userSource,
      name: user.name,
      companyDomain: user.companyDomain,
      firstName: user.firstName,
      middleName: user.middleName,
      lastName: user.lastName,
      linkedin: user.linkedin,
    };
  };

  platformSearch = {
    /**
     * voilanorbert [support: email]
     */
    [PeopleFinderPlatforms.voilanorbert]: async (
      user: ContactSearchPeopleDto
    ) => {
      const {name, companyDomain} = user;
      if (!name || !companyDomain) return;
      const newRecord = await this.prisma.contactSearch.create({
        data: {
          ...this.getCommonContactSearch(user),
          source: PeopleFinderPlatforms.voilanorbert,
          sourceMode: 'searchEmailByDomain',
          status: PeopleFinderStatus.pending,
        },
      });
      // todo spent
      const {res, error} =
        await this.peopleFinder.voilaNorbert.searchEmailByDomain({
          name,
          companyDomain,
          webhook:
            this.callBackOrigin +
            '/people-finder/voilanorbert-hook?id=' +
            newRecord.id, // todo
        });
      return await this.voilanorbertContactSearchCallback(
        newRecord.id,
        res,
        error
      );
    },
    /**
     * proxycurl [support: email,phone]
     */
    [PeopleFinderPlatforms.proxycurl]: async (
      user: ContactSearchPeopleDto,
      {phone, email}: SearchFilter
    ) => {
      if (user.linkedin) {
        const newRecord = await this.prisma.contactSearch.create({
          data: {
            ...this.getCommonContactSearch(user),
            sourceMode: 'searchPeopleByLinkedin',
            source: PeopleFinderPlatforms.proxycurl,
            status: PeopleFinderStatus.pending,
          },
        });
        const {res, error, spent} =
          await this.peopleFinder.proxycurl.searchPeopleByLinkedin({
            linkedinUrl: user.linkedin,
            personalEmail: email ? 'include' : 'exclude',
            personalContactNumber: phone ? 'include' : 'exclude',
          });
        const updateData: Prisma.ContactSearchUpdateInput = {};

        if (error) {
          updateData.status = PeopleFinderStatus.failed;
          updateData.ctx = error as object;
        } else if (res) {
          updateData.emails = res.personal_emails;
          updateData.phones = res.personal_numbers;
          updateData.status = PeopleFinderStatus.completed;
          updateData.ctx = res as object;
        }
        updateData.spent = spent;

        return await this.prisma.contactSearch.update({
          where: {id: newRecord.id},
          data: updateData,
        });
      } else if (user.companyDomain && user.firstName) {
        const newRecord = await this.prisma.contactSearch.create({
          data: {
            ...this.getCommonContactSearch(user),
            sourceMode: 'searchPeopleLinkedin',
            source: PeopleFinderPlatforms.proxycurl,
            status: PeopleFinderStatus.pending,
          },
        });

        const {res, error, spent} =
          await this.peopleFinder.proxycurl.searchPeopleLinkedin({
            firstName: user.firstName,
            lastName: user.lastName,
            companyDomain: user.companyDomain,
          });
        const updateData: Prisma.ContactSearchUpdateInput = {};

        if (error) {
          updateData.status = PeopleFinderStatus.failed;
          updateData.ctx = error as object;
        } else if (res && res.url) {
          updateData.linkedin = res.url;
          updateData.status = PeopleFinderStatus.completed;
          updateData.ctx = res as object;
        } else {
          updateData.status = PeopleFinderStatus.failed;
          updateData.ctx = res as object;
        }
        updateData.spent = spent;

        await this.prisma.contactSearch.update({
          where: {id: newRecord.id},
          data: updateData,
        });

        if (res && res.url) {
          await this.platformSearch[PeopleFinderPlatforms.proxycurl](
            {
              ...user,
              linkedin: res.url,
            },
            {phone, email}
          );
        }
      }
    },
    /**
     * peopledatalabs [support: email,phone]
     */
    [PeopleFinderPlatforms.peopledatalabs]: async (
      user: ContactSearchPeopleDto,
      {phone, email}: SearchFilter
    ) => {
      if (user.linkedin) {
        const newRecord = await this.prisma.contactSearch.create({
          data: {
            ...this.getCommonContactSearch(user),
            sourceMode: 'searchPeopleByLinkedin',
            source: PeopleFinderPlatforms.peopledatalabs,
            status: PeopleFinderStatus.pending,
          },
        });
        const {error, res} =
          await this.peopleFinder.peopledatalabs.searchPeopleByLinkedin({
            linkedinUrl: user.linkedin,
          });
        const updateData: Prisma.ContactSearchUpdateInput = {};
        if (error) {
          updateData.status = PeopleFinderStatus.failed;
          updateData.ctx = error as object;
        } else if (res) {
          updateData.spent = res.rateLimit.callCreditsSpent;
          if (res.data) {
            updateData.emails = res.data.emails as object;
            updateData.phones = res.data.phone_numbers
              ? res.data.phone_numbers
              : [];
            updateData.status = PeopleFinderStatus.completed;
            updateData.ctx = res as object;
          } else {
            updateData.status = PeopleFinderStatus.failed;
            updateData.ctx = {
              msg: 'No data records were found for this person',
              res: res as object,
            };
          }
        }
        await this.prisma.contactSearch.update({
          where: {id: newRecord.id},
          data: updateData,
        });

        // If not found, use domain query
        if (
          !res ||
          ((!res.data.emails || !res.data.emails.length) &&
            (!res.data.phone_numbers || !res.data.phone_numbers.length))
        ) {
          await this.platformSearch[PeopleFinderPlatforms.peopledatalabs](
            {
              ...user,
              linkedin: '',
            },
            {phone, email}
          );
        }
      } else if (user.companyDomain && user.name) {
        const newRecord = await this.prisma.contactSearch.create({
          data: {
            ...this.getCommonContactSearch(user),
            sourceMode: 'searchPeopleByDomain',
            source: PeopleFinderPlatforms.peopledatalabs,
            status: PeopleFinderStatus.pending,
          },
        });
        const {error, res} =
          await this.peopleFinder.peopledatalabs.searchPeopleByDomain({
            companyDomain: user.companyDomain,
            name: user.name,
            phone: true,
            email: true,
          });
        const updateData: Prisma.ContactSearchUpdateInput = {};
        if (error) {
          updateData.status = PeopleFinderStatus.failed;
          updateData.ctx = error as object;
        } else if (res) {
          updateData.spent = res.rateLimit.callCreditsSpent;
          const dataArray = res.data;
          if (dataArray.length) {
            updateData.emails = dataArray[0].emails as object;
            updateData.phones = dataArray[0].mobile_phone
              ? [dataArray[0].mobile_phone]
              : [];
            updateData.status = PeopleFinderStatus.completed;
            updateData.ctx = res as object;
          } else if (!dataArray || !dataArray.length) {
            updateData.status = PeopleFinderStatus.failed;
            updateData.ctx = {
              msg: 'No data records were found for this person',
              res: res as object,
            };
          }
        }
        return await this.prisma.contactSearch.update({
          where: {id: newRecord.id},
          data: updateData,
        });
      }
    },
  };

  @NoGuard()
  @Post('contact-search')
  @ApiBody({
    type: ContactSearchReqDto,
  })
  async contactSearch(
    @Body()
    body: ContactSearchReqDto
  ) {
    const {platforms, peoples} = body;
    for (let i = 0; i < peoples.length; i++) {
      const people = peoples[i];
      for (let platI = 0; platI < platforms.length; platI++) {
        const platform = platforms[platI];

        // Check if the current personnel have records on the current platform, and do not execute those with records
        const isExist = await this.peopleFinder.isExist({
          platform,
          userId: people.userId,
          userSource: people.userSource,
        });
        if (isExist) continue;

        if (platform === PeopleFinderPlatforms.voilanorbert) {
          await this.platformSearch[platform](people);
        }

        if (platform === PeopleFinderPlatforms.proxycurl) {
          await this.platformSearch[platform](people, {
            phone: true,
            email: true,
          });
        }

        if (platform === PeopleFinderPlatforms.peopledatalabs) {
          await this.platformSearch[platform](people, {
            phone: true,
            email: true,
          });
        }
      }
    }
    return 'ok';
  }

  @NoGuard()
  @Post('add-task-contact-search')
  @ApiBody({
    type: AddTaskContactSearchReqDto,
  })
  @ApiResponse({
    type: AddTaskContactSearchResDto,
  })
  async addTaskcontactSearch(
    @Body()
    body: AddTaskContactSearchReqDto
  ) {
    let {taskId} = body;
    if (!taskId) taskId = generateRandomCode(10);
    await this.addJobs(body.peoples.map(item => ({...item, taskId: taskId!})));
    return {taskId};
  }

  async addJobs(data: PeopleFinderBullJob[]): Promise<Job[]> {
    return await this.queue.addBulk(data.map(item => ({data: item})));
  }

  @NoGuard()
  @Post('contact-search-phone')
  @ApiBody({
    description: '',
  })
  async contactSearchPhone(
    @Body()
    body: ContactSearchReqDto
  ) {
    const {peoples} = body;
    for (let i = 0; i < peoples.length; i++) {
      const people = peoples[i];

      // Check if the current personnel have records on the current platform, and do not execute those with records
      const isExist = await this.peopleFinder.isExist({
        platform: PeopleFinderPlatforms.peopledatalabs,
        userId: people.userId,
        userSource: people.userSource,
      });
      if (isExist) continue;

      await this.platformSearch.peopledatalabs(people, {
        phone: true,
        email: false,
      });
    }
    return 'ok';
  }

  @NoGuard()
  @Post('contact-search-email')
  @ApiBody({
    description: '',
  })
  async contactSearchEmail(
    @Body()
    body: ContactSearchReqDto
  ) {
    const {peoples} = body;
    for (let i = 0; i < peoples.length; i++) {
      const people = peoples[i];

      // Check if the current personnel have records on the current platform, and do not execute those with records
      const isExist = await this.peopleFinder.isExist({
        platform: PeopleFinderPlatforms.voilanorbert,
        userId: people.userId,
        userSource: people.userSource,
      });
      if (!isExist) {
        await this.platformSearch.voilanorbert(people);
      }

      // Check if the current personnel have records on the current platform, and do not execute those with records
      const isExist2 = await this.peopleFinder.isExist({
        platform: PeopleFinderPlatforms.proxycurl,
        userId: people.userId,
        userSource: people.userSource,
      });
      if (!isExist2) {
        await this.platformSearch.proxycurl(people, {
          phone: false,
          email: true,
        });
      }
    }
    return 'ok';
  }

  /**
   * This is the interface for callback of third-party services
   */
  @NoGuard()
  @Post('voilanorbert-hook')
  async voilanorbertHook(
    @Query('id')
    id: number,
    @Body()
    res: SearchEmailThirdResDto['data']
  ) {
    const findRes = await this.peopleFinder.voilanorbertContactSearchCallback(
      Number(id),
      res
    );

    // searching completed && no email
    if (findRes?.res?.searching === false && !findRes?.dataFlag.email) {
      const record = await this.prisma.contactSearch.findFirst({
        where: {id: Number(id)},
      });
      if (record && record.userId && record.userSource) {
        // Check if the current personnel have records on the current platform, and do not execute those with records
        const isExist = await this.peopleFinder.isExist({
          platform: PeopleFinderPlatforms.proxycurl,
          userId: record.userId,
          userSource: record.userSource,
        });
        if (isExist) return {};

        await this.peopleFinder.proxycurlFind(
          {
            userId: record.userId,
            userSource: record.userSource,
            linkedin: record.linkedin as string,
            companyDomain: record.companyDomain as string,
            name: record.name as string,
            firstName: record.firstName as string,
            middleName: record.middleName as string,
            lastName: record.lastName as string,
            taskId: record.taskId as string,
          },
          {
            phone: true,
            email: true,
          }
        );
      }
    }
    this.logger.log(
      'voilanorbert-hook:' + id + ' [res]:' + JSON.stringify(res),
      this.loggerContext
    );
    return 'ok';
  }

  async voilanorbertContactSearchCallback(
    id: number,
    data?: SearchEmailContentResDto,
    error?: object
  ) {
    const updateData: Prisma.ContactSearchUpdateInput = {};
    if (error) {
      updateData.status = PeopleFinderStatus.failed;
      updateData.ctx = error;
    } else if (data) {
      if (!data.searching) {
        updateData.emails = data.email ? [data.email as object] : [];
        updateData.status = PeopleFinderStatus.completed;
      }
      updateData.ctx = data as object;
    }
    await this.prisma.contactSearch.update({
      where: {id: id},
      data: updateData,
    });
  }

  @NoGuard()
  @Get('analysis')
  async analysis() {
    const res = await this.prisma.contactSearch.findMany({
      distinct: ['userId', 'companyDomain', 'linkedin', 'source', 'sourceMode'],
      where: {
        status: {in: [PeopleFinderStatus.failed, PeopleFinderStatus.completed]},
        id: {gt: 1841},
      },
    });
    const sourceMap = {
      [PeopleFinderPlatforms.voilanorbert]: {
        [PeopleFinderStatus.completed]: [],
        [PeopleFinderStatus.failed]: [],
      },
      [PeopleFinderPlatforms.proxycurl]: {
        [PeopleFinderStatus.completed]: [],
        [PeopleFinderStatus.failed]: [],
      },
      [PeopleFinderPlatforms.peopledatalabs]: {
        [PeopleFinderStatus.completed]: [],
        [PeopleFinderStatus.failed]: [],
      },
    };
    const userMap: {
      [x: string]: {
        [T in PeopleFinderPlatforms]?: {
          list: typeof res;
          completed: number;
          failed: number;
          total: number;
        };
      };
    } = {};
    res.forEach(item => {
      sourceMap[item.source][item.status].push(item);
      if (!userMap[item.userId!]) {
        userMap[item.userId!] = {};
      }
      if (!userMap[item.userId!][item.source]) {
        userMap[item.userId!][item.source] = {
          list: [],
          hasEmail: 0,
          hasPhone: 0,
          total: 0,
        };
      }
      const dataIndex = userMap[item.userId!][item.source];
      if (item.emails.length) {
        dataIndex.hasEmail++;
      }
      if (item.phones.length) {
        dataIndex.hasPhone++;
      }
      dataIndex.list.push(item);
      dataIndex.total++;
    });
    const groupName = {
      [PeopleFinderPlatforms.peopledatalabs.length +
      PeopleFinderPlatforms.proxycurl.length]:
        PeopleFinderPlatforms.peopledatalabs +
        '+' +
        PeopleFinderPlatforms.proxycurl,
      [PeopleFinderPlatforms.voilanorbert.length +
      PeopleFinderPlatforms.proxycurl.length]:
        PeopleFinderPlatforms.voilanorbert +
        '+' +
        PeopleFinderPlatforms.proxycurl,
      [PeopleFinderPlatforms.voilanorbert.length +
      PeopleFinderPlatforms.peopledatalabs.length]:
        PeopleFinderPlatforms.voilanorbert +
        '+' +
        PeopleFinderPlatforms.peopledatalabs,
      [PeopleFinderPlatforms.voilanorbert.length +
      PeopleFinderPlatforms.peopledatalabs.length +
      PeopleFinderPlatforms.proxycurl.length]:
        PeopleFinderPlatforms.voilanorbert +
        '+' +
        PeopleFinderPlatforms.peopledatalabs +
        '+' +
        PeopleFinderPlatforms.proxycurl,
    };
    const groupMap = {
      [PeopleFinderPlatforms.peopledatalabs.length +
      PeopleFinderPlatforms.proxycurl.length]: {
        total: 0,
        email: 0,
        phone: 0,
      },
      [PeopleFinderPlatforms.voilanorbert.length +
      PeopleFinderPlatforms.peopledatalabs.length]: {
        total: 0,
        email: 0,
        phone: 0,
      },
      [PeopleFinderPlatforms.voilanorbert.length +
      PeopleFinderPlatforms.proxycurl.length]: {
        total: 0,
        email: 0,
        phone: 0,
      },
      [PeopleFinderPlatforms.voilanorbert.length +
      PeopleFinderPlatforms.proxycurl.length +
      PeopleFinderPlatforms.peopledatalabs.length]: {
        total: 0,
        email: 0,
        phone: 0,
      },
    };
    const twoPlatCount = (userId, platformA, platformB) => {
      const groupKey = platformA.length + platformB.length;
      groupMap[groupKey].total++;
      if (
        userMap[userId][platformA].hasEmail ||
        userMap[userId][platformB].hasEmail
      ) {
        groupMap[groupKey].email++;
      }
      if (
        userMap[userId][platformA].hasPhone ||
        userMap[userId][platformB].hasPhone
      ) {
        groupMap[groupKey].phone++;
      }
    };
    Object.keys(userMap).forEach(userId => {
      const platforms = Object.keys(userMap[userId]);
      if (platforms.length === 2) {
        twoPlatCount(userId, platforms[0], platforms[1]);
      }
      if (platforms.length === 3) {
        twoPlatCount(userId, platforms[0], platforms[1]);
        twoPlatCount(userId, platforms[1], platforms[2]);
        twoPlatCount(userId, platforms[0], platforms[2]);
        const groupKey =
          platforms[0].length + platforms[1].length + platforms[2].length;
        groupMap[groupKey].total++;
        if (
          userMap[userId][platforms[0]].hasEmail ||
          userMap[userId][platforms[1]].hasEmail ||
          userMap[userId][platforms[2]].hasEmail
        ) {
          groupMap[groupKey].email++;
        }
        if (
          userMap[userId][platforms[0]].hasPhone ||
          userMap[userId][platforms[1]].hasPhone ||
          userMap[userId][platforms[2]].hasPhone
        ) {
          groupMap[groupKey].phone++;
        }
      }
    });
    const groupResult = {};
    Object.keys(groupMap).forEach(key => {
      groupResult[groupName[key]] = {
        ...groupMap[key],
        phonePer: groupMap[key].phone / groupMap[key].total,
        emailPer: groupMap[key].email / groupMap[key].total,
      };
    });
    /* delete 402
    const deletes: number[] = [];
    sourceMap[PeopleFinderPlatforms.peopledatalabs] = sourceMap[
      PeopleFinderPlatforms.peopledatalabs
    ].filter((item: (typeof res)[0]) => {
      // filter 402
      if (
        !item.ctx ||
        // No balance
        ((item.ctx as PeopleFinderError).error &&
          (item.ctx as PeopleFinderError).error.status === 402)
      ) {
        deletes.push(item.id);
        return false;
      }
      return true;
    });
    const xx = await this.prisma.contactSearch.updateMany({
      where: {id: {in: deletes}},
      data: {
        status: PeopleFinderStatus.deleted,
      },
    });
     */

    const result = {};
    Object.keys(sourceMap).forEach(key => {
      if (!result[key]) {
        result[key] = {
          total: 0,
          hasEmails: 0,
          emailPer: 0,
          hasPhones: 0,
          phonePer: 0,
          completed: sourceMap[key].completed.length,
          failed: sourceMap[key].failed.length,
        };
      }
      result[key].total =
        sourceMap[key].completed.length + sourceMap[key].failed.length;
      sourceMap[key].completed.forEach(item => {
        if (item.emails.length) result[key].hasEmails++;
        if (item.phones.length) result[key].hasPhones++;
      });
      result[key].emailPer = result[key].hasEmails / result[key].total;
      result[key].phonePer = result[key].hasPhones / result[key].total;
    });

    const exportData = res.map(item => {
      if (item.emails && item.emails.length) {
        if (item.source === PeopleFinderPlatforms.voilanorbert) {
          item.emails = item.emails.map(
            (emailCon: {email: string; score: number}) => emailCon.email
          );
        }
        if (item.source === PeopleFinderPlatforms.peopledatalabs) {
          item.emails = item.emails.map(
            (emailCon: {address: string; type: string}) => emailCon.address
          );
        }
        // @ts-ignore
        item.emails = item.emails.join('|');
      } else {
        // @ts-ignore
        item.emails = '';
      }
      if (item.phones && item.phones.length) {
        // @ts-ignore
        item.phones = item.phones.join('|');
      } else {
        // @ts-ignore
        item.phones = '';
      }
      // @ts-ignore
      delete item.ctx;
      return item;
    });
    return {result, groupResult, exportData};
  }
  /* End */
}
