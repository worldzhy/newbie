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
  GetTaskContactSearchReqDto,
  GetTaskStatusResDto,
} from './people-finder.dto';
import {
  SearchEmailThirdResDto,
  SearchEmailContentResDto,
} from '@microservices/people-finder/voila-norbert/volia-norbert.service';
import {PeopleFinderTaskStatus} from '@microservices/people-finder/constants';
import {VoilaNorbertService} from '@microservices/people-finder/voila-norbert/volia-norbert.service';
import {ProxycurlService} from '@microservices/people-finder/proxycurl/proxycurl.service';
import {PeopledatalabsService} from '@microservices/people-finder/peopledatalabs/peopledatalabs.service';
import {
  PeopleFinderService,
  PeopleFinderPlatforms,
  PeopleFinderStatus,
} from '@microservices/people-finder/people-finder.service';
import {PeopleFinderQueue} from './people-finder.processor';

type SearchFilter = {needPhone: boolean; needEmail: boolean};

@ApiTags('People-finder')
@ApiBearerAuth()
@Controller('people-finder')
export class PeopleFinderController {
  private loggerContext = 'PeopleFinder';
  callBackOrigin: string;

  constructor(
    private readonly configService: ConfigService,
    private voilaNorbertService: VoilaNorbertService,
    private proxycurlService: ProxycurlService,
    private peopledatalabsService: PeopledatalabsService,
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
      const {res, error} = await this.voilaNorbertService.searchEmailByDomain({
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
      {needPhone, needEmail}: SearchFilter
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
          await this.proxycurlService.searchPeopleByLinkedin({
            linkedinUrl: user.linkedin,
            personalEmail: needEmail ? 'include' : 'exclude',
            personalContactNumber: needPhone ? 'include' : 'exclude',
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
          await this.proxycurlService.searchPeopleLinkedin({
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
            {needPhone, needEmail}
          );
        }
      }
    },
    /**
     * peopledatalabs [support: email,phone]
     */
    [PeopleFinderPlatforms.peopledatalabs]: async (
      user: ContactSearchPeopleDto,
      {needPhone, needEmail}: SearchFilter
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
          await this.peopledatalabsService.searchPeopleByLinkedin({
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
            {needPhone, needEmail}
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
          await this.peopledatalabsService.searchPeopleByDomain({
            companyDomain: user.companyDomain,
            name: user.name,
            needPhone: true,
            needEmail: true,
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
            needPhone: true,
            needEmail: true,
          });
        }

        if (platform === PeopleFinderPlatforms.peopledatalabs) {
          await this.platformSearch[platform](people, {
            needPhone: true,
            needEmail: true,
          });
        }
      }
    }
    return 'ok';
  }

  @NoGuard()
  @Post('create-contact-search-task-id')
  @ApiResponse({
    type: AddTaskContactSearchResDto,
  })
  async createContactSearchTaskId() {
    const taskId = generateRandomCode(15);
    return {taskId};
  }

  @NoGuard()
  @Post('add-contact-search-task')
  @ApiResponse({
    type: AddTaskContactSearchResDto,
  })
  async addContactSearchTask(
    @Body()
    body: AddTaskContactSearchReqDto
  ) {
    const {taskId} = body;
    await await this.queue.addBulk(
      body.peoples.map(item => ({data: {...item, taskId: taskId!}}))
    );
    return {taskId};
  }

  @NoGuard()
  @Get('get-contact-search-task-jobs')
  async getJobsByTaskId(
    @Query()
    query: GetTaskContactSearchReqDto
  ): Promise<Job[]> {
    const limit = 100;
    let start = 0,
      end = limit - 1,
      allList: Job[] = [],
      flag = true;

    while (flag) {
      const list = await this.queue.getJobs(
        ['completed', 'waiting', 'active', 'delayed', 'failed', 'paused'],
        start,
        end
      );
      allList = allList.concat(list);
      if (list.length && list.length === limit) {
        start += limit;
        end += limit;
      } else {
        flag = false;
      }
    }
    return allList.filter(item => item.data.taskId === query.taskId);
  }

  @NoGuard()
  @Get('get-contact-search-task-status')
  @ApiResponse({
    type: GetTaskStatusResDto,
  })
  async getStatusByTaskId(
    @Query()
    query: GetTaskContactSearchReqDto
  ): Promise<GetTaskStatusResDto> {
    const total = await this.prisma.contactSearchTask.count({
      where: {
        taskId: query.taskId,
      },
    });
    const totalCompleted = await this.prisma.contactSearchTask.count({
      where: {
        status: PeopleFinderTaskStatus.completed,
        taskId: query.taskId,
      },
    });
    return {
      totalCompleted,
      total,
      completed: totalCompleted === total,
    };
  }

  @NoGuard()
  @Get('get-contact-search-task-result')
  async getResultByTaskId(
    @Query()
    query: GetTaskContactSearchReqDto
  ) {
    const list = await this.prisma.contactSearchTask.findMany({
      where: {
        status: PeopleFinderTaskStatus.completed,
        taskId: query.taskId,
      },
      include: {
        contactSearch: {
          where: {
            OR: [
              {
                emails: {
                  isEmpty: false,
                },
              },
              {
                phones: {
                  isEmpty: false,
                },
              },
            ],
          },
        },
      },
    });

    const userMap: {
      [userId: string]: (typeof list)[0]['contactSearch'];
    } = {};

    list
      .map(item => item.contactSearch)
      .forEach(item => {
        if (item) {
          // get email string
          if (item.emails) {
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
          }

          if (!userMap[item.userId!]) {
            userMap[item.userId!] = item;
          } else {
            const user = userMap[item.userId!]!;
            if (item.emails) {
              user.emails = user.emails.concat(item.emails);
            }

            if (item.phones) {
              user.phones = user.phones.concat(item.phones);
            }
          }
        }
      });

    const result: {
      userId: string;
      emails: unknown[];
      phones: unknown[];
    }[] = [];

    Object.keys(userMap).forEach(key => {
      const user = userMap[key]!;
      result.push({
        userId: user.userId!,
        phones: Array.from(new Set(user.phones)),
        emails: Array.from(new Set(user.emails)),
      });
    });

    return result;
  }

  /**
   * This is the interface for callback of third-party services
   */
  @NoGuard()
  @Post('voilanorbert-hook')
  async voilanorbertHook(
    @Query('id')
    id: number,
    @Query('taskId')
    taskId: number,
    @Body()
    res: SearchEmailThirdResDto['data']
  ) {
    const findRes =
      await this.voilaNorbertService.voilanorbertContactSearchCallback(
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
        const isExistTaskId = await this.peopleFinder.isExist({
          platform: PeopleFinderPlatforms.proxycurl,
          userId: record.userId,
          userSource: record.userSource,
        });

        let contactSearchId;

        if (isExistTaskId) {
          contactSearchId = isExistTaskId;
        } else {
          const findRes = await this.proxycurlService.find(
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
              needPhone: true,
              needEmail: true,
            }
          );
          if (findRes) {
            contactSearchId = findRes.contactSearchId;
          }
        }

        await this.prisma.contactSearchTask.update({
          where: {id: Number(taskId)},
          data: {
            contactSearchId,
            status: PeopleFinderTaskStatus.completed,
          },
        });
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
