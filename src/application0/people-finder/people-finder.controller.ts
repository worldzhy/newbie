import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
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
  CreateContactSearchBranchResDto,
  GetContactSearchBranchReqDto,
  GetBranchStatusResDto,
} from './people-finder.dto';
import {
  SearchEmailThirdResDto,
  SearchEmailContentResDto,
} from '@microservices/people-finder/voila-norbert/volia-norbert.service';
import {
  PeopleFinderTaskStatus,
  PeopleFinderStatus,
  PeopleFinderTaskBullJob,
} from '@microservices/people-finder/constants';
import {VoilaNorbertService} from '@microservices/people-finder/voila-norbert/volia-norbert.service';
import {ProxycurlService} from '@microservices/people-finder/proxycurl/proxycurl.service';
import {CreateContactSearchTaskBranchReqDto} from '@microservices/people-finder/people-finder.dto';
import {
  PeopleFinderService,
  PeopleFinderPlatforms,
} from '@microservices/people-finder/people-finder.service';
import {PeopleFinderQueue} from './people-finder.processor';

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
    private readonly peopleFinder: PeopleFinderService,
    private readonly logger: CustomLoggerService,
    private readonly prisma: PrismaService,
    @InjectQueue(PeopleFinderQueue) public queue: Queue
  ) {
    this.callBackOrigin = this.configService.getOrThrow<string>(
      'microservice.peopleFinder.voilanorbert.callbackOrigin'
    );
  }

  @NoGuard()
  @Post('create-contact-search-branch-id')
  @ApiResponse({
    type: CreateContactSearchBranchResDto,
  })
  async createContactSearchBranchId() {
    const branchId = generateRandomCode(15);
    const isExist = await this.prisma.peopleFinderTaskBranch.findFirst({
      where: {
        branchId,
      },
    });
    if (isExist) return await this.createContactSearchBranchId();
    return {branchId};
  }

  @NoGuard()
  @Post('create-contact-search-branch')
  @ApiResponse({
    type: CreateContactSearchBranchResDto,
  })
  async createContactSearchTaskBranch(
    @Body()
    body: CreateContactSearchTaskBranchReqDto
  ) {
    const {branchId} = body;
    await this.peopleFinder.createTaskBranch(body);
    const tasks = await this.peopleFinder.getTaskBrancTasks(branchId);
    const datas: PeopleFinderTaskBullJob[] = tasks.map(
      item =>
        ({
          id: item.id,
          taskBranchId: item.taskBranchId,
          userId: item.userId,
          userSource: item.userSource,
          name: item.name,
          firstName: item.firstName,
          middleName: item.middleName,
          lastName: item.lastName,
          companyDomain: item.companyDomain,
          linkedin: item.linkedin,
          findEmail: item.findEmail,
          findPhone: item.findPhone,
        }) as PeopleFinderTaskBullJob
    );
    await this.queue.addBulk(datas.map(item => ({data: item})));
    return {branchId};
  }

  @NoGuard()
  @Get('get-contact-search-branch-jobs')
  async getJobsByBranchId(
    @Query()
    query: GetContactSearchBranchReqDto
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
    return allList.filter(item => item.data.branchId === query.branchId);
  }

  @NoGuard()
  @Get('get-contact-search-branch-status')
  @ApiResponse({
    type: GetBranchStatusResDto,
  })
  async getStatusByBranchId(
    @Query()
    query: GetContactSearchBranchReqDto
  ): Promise<GetBranchStatusResDto> {
    return await this.peopleFinder.checkTaskBranchStatus({
      branchId: query.branchId,
    });
  }

  @NoGuard()
  @Get('get-contact-search-branch-result')
  async getResultByBranchId(
    @Query()
    query: GetContactSearchBranchReqDto
  ) {
    const taskBranch = await this.prisma.peopleFinderTaskBranch.findFirst({
      where: {
        branchId: query.branchId,
      },
    });
    if (!taskBranch) {
      throw new BadRequestException('BranchId not found.');
    }
    const list = await this.prisma.peopleFinderTask.findMany({
      where: {
        status: PeopleFinderTaskStatus.completed,
        taskBranchId: taskBranch.id,
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
    });

    const userMap: {
      [userId: string]: (typeof list)[0];
    } = {};

    list.forEach(item => {
      if (item) {
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
        phones: user.phones,
        emails: user.emails,
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
      const record = await this.prisma.peopleFinderCallThirdParty.findFirst({
        where: {id: Number(id)},
      });
      if (record && record.userId && record.userSource) {
        // Check if the current personnel have records on the current platform, and do not execute those with records
        const isExistTaskId = await this.peopleFinder.isExist({
          platform: PeopleFinderPlatforms.proxycurl,
          userId: record.userId,
          userSource: record.userSource,
        });

        let callThirdPartyId;

        if (isExistTaskId) {
          callThirdPartyId = isExistTaskId;
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
            },
            {
              needPhone: true,
              needEmail: true,
            }
          );
          if (findRes) {
            callThirdPartyId = findRes.callThirdPartyId;
          }
        }

        const oldData = await this.prisma.peopleFinderTask.findFirst({
          where: {id: Number(taskId)},
        });

        await this.prisma.peopleFinderTask.update({
          where: {id: Number(taskId)},
          data: {
            callThirdPartyIds: oldData?.callThirdPartyIds.concat([
              callThirdPartyId,
            ]),
          },
        });
      }
    }

    const taskRecord = await this.prisma.peopleFinderTask.update({
      where: {id: Number(taskId)},
      data: {
        status: PeopleFinderTaskStatus.completed,
      },
    });
    await this.peopleFinder.checkAndExecuteTaskBranchCallback(
      taskRecord.taskBranchId!
    );
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
    const updateData: Prisma.PeopleFinderCallThirdPartyUpdateInput = {};
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
    await this.prisma.peopleFinderCallThirdParty.update({
      where: {id: id},
      data: updateData,
    });
  }

  @NoGuard()
  @Get('analysis')
  async analysis() {
    const res = await this.prisma.peopleFinderCallThirdParty.findMany({
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
    const xx = await this.prisma.peopleFinderCallThirdParty.updateMany({
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
