import {Logger, Injectable, BadRequestException} from '@nestjs/common';
import {HttpService} from '@nestjs/axios';
import {Prisma} from '@prisma/client';
import {PrismaService} from '@framework/prisma/prisma.service';
import {
  PeopleFinderStatus,
  PeopleFinderPlatforms,
  PeopleFinderTaskStatus,
  PeopleFinderBatchTaskStatus,
  PeopleFinderBatchTaskCallBackStatus,
} from './constants';
import {PeopleFinderUserReq} from '@microservices/people-finder/constants';
import {CreateContactSearchTaskBatchReqDto} from './people-finder.dto';
import {PeopleFinderNotificationService} from './people-finder.notification.service';
export * from './constants';

@Injectable()
export class PeopleFinderService {
  private loggerContext = 'PeopleFinderService';

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
    private httpService: HttpService,
    private peopleFinderNotification: PeopleFinderNotificationService
  ) {}

  async isExist({
    platform,
    data,
    sourceMode,
  }: {
    platform: PeopleFinderPlatforms;
    data: PeopleFinderUserReq;
    sourceMode: string;
  }) {
    const buildWhere: Prisma.PeopleFinderCallThirdPartyWhereInput = {};
    // Search emails only by company domain and name
    if (platform === PeopleFinderPlatforms.voilanorbert) {
      buildWhere.companyDomain = data.companyDomain;
      buildWhere.name = data.name;
    }
    // Only findPhone and byDomain mode
    if (platform === PeopleFinderPlatforms.peopledatalabs) {
      if (data.linkedin) buildWhere.linkedin = data.linkedin;
      if (data.companyDomain) {
        buildWhere.name = data.name;
        buildWhere.companyDomain = data.companyDomain;
      }
    }
    // linkedin and domain+firstName
    if (platform === PeopleFinderPlatforms.proxycurl) {
      if (data.linkedin) buildWhere.linkedin = data.linkedin;
      if (data.companyDomain) {
        buildWhere.firstName = data.firstName;
        buildWhere.companyDomain = data.companyDomain;
      }
    }
    const res = await this.prisma.peopleFinderCallThirdParty.findFirst({
      where: {
        status: {
          notIn: [
            PeopleFinderStatus.deleted,
            PeopleFinderStatus.parameterError,
          ],
        },
        source: platform,
        userId: data.userId,
        userSource: data.userSource,
        sourceMode,
        ...buildWhere,
      },
    });
    if (res) return res;
    return null;
  }

  async createTaskBatch({
    batchId,
    peoples,
    callbackUrl,
  }: CreateContactSearchTaskBatchReqDto): Promise<{taskBatchId: number}> {
    const taskBatch = await this.prisma.peopleFinderTaskBatch.findFirst({
      where: {
        batchId,
      },
    });
    if (taskBatch) {
      throw new BadRequestException('BatchId already exists.');
    }
    const newTaskBatch = await this.prisma.peopleFinderTaskBatch.create({
      data: {
        batchId,
        status: PeopleFinderBatchTaskStatus.pending,
        callbackUrl,
        callbackStatus: PeopleFinderBatchTaskCallBackStatus.pending,
      },
    });
    await this.prisma.peopleFinderTask.createMany({
      data: peoples.map(item => ({
        ...item,
        status: PeopleFinderTaskStatus.pending,
        taskBatchId: newTaskBatch.id,
      })),
    });
    return {taskBatchId: newTaskBatch.id};
  }

  async getTaskBatchTasks(
    batchId: string,
    options: {status?: PeopleFinderTaskStatus} = {}
  ) {
    const taskBatch = await this.prisma.peopleFinderTaskBatch.findFirst({
      where: {
        batchId,
      },
    });
    if (!taskBatch) {
      throw new BadRequestException('Batch not found.');
    }
    return await this.prisma.peopleFinderTask.findMany({
      where: {
        taskBatchId: taskBatch.id,
        ...options,
      },
    });
  }

  async checkTaskBatchStatus({
    batchId,
    taskBatchId,
  }: {
    batchId?: string;
    taskBatchId?: number;
  }) {
    const taskBatch = await this.prisma.peopleFinderTaskBatch.findFirst({
      where: taskBatchId
        ? {id: taskBatchId}
        : {
            batchId,
          },
    });
    if (!taskBatch) {
      throw new BadRequestException('BatchId not found.');
    }
    const total = await this.prisma.peopleFinderTask.count({
      where: {
        taskBatchId: taskBatch.id,
      },
    });
    const totalCompleted = await this.prisma.peopleFinderTask.count({
      where: {
        status: PeopleFinderTaskStatus.completed,
        taskBatchId: taskBatch.id,
      },
    });
    return {
      totalCompleted,
      total,
      completed: totalCompleted === total,
    };
  }

  async checkAndExecuteTaskBatchCallback(taskBatchId: number) {
    const {completed} = await this.checkTaskBatchStatus({
      taskBatchId: taskBatchId,
    });

    if (!completed) return;

    await this.prisma.peopleFinderTaskBatch.update({
      where: {id: taskBatchId},
      data: {
        status: PeopleFinderBatchTaskStatus.synchronizingData,
      },
    });

    const list = await this.prisma.peopleFinderTask.findMany({
      where: {taskBatchId},
    });

    for (let i = 0; i < list.length; i++) {
      const task = list[i];
      const resultList = await this.prisma.peopleFinderCallThirdParty.findMany({
        where: {id: {in: task.callThirdPartyIds}},
      });

      // get emails \ phones \ linkedins
      let emails: string[] = [];
      let phones: string[] = [];
      let linkedins: string[] = [];
      resultList.map(item => {
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
          emails = emails.concat(item.emails as string[]);
        }
        if (item.phones && item.phones.length) {
          phones = phones.concat(item.phones as string[]);
        }
        if (item.linkedins && item.linkedins.length) {
          linkedins = linkedins.concat(item.linkedins as string[]);
        }
      });

      await this.prisma.peopleFinderTask.update({
        where: {id: task.id},
        data: {
          emails: Array.from(new Set(emails)),
          phones: Array.from(new Set(phones)),
          linkedins: Array.from(new Set(linkedins)),
        },
      });
    }

    const taskBatch = await this.prisma.peopleFinderTaskBatch.update({
      where: {id: taskBatchId},
      data: {
        status: PeopleFinderBatchTaskStatus.completed,
      },
    });

    if (
      taskBatch?.callbackUrl &&
      taskBatch.callbackStatus !== PeopleFinderBatchTaskCallBackStatus.completed
    ) {
      this.httpService.axiosRef
        .post<{batchId: string}, {status: number; data: string}>(
          taskBatch?.callbackUrl,
          {batchId: taskBatch.batchId}
        )
        .then(async res => {
          if (res.status >= 200 && res.status < 300) {
            await this.prisma.peopleFinderTaskBatch.update({
              where: {id: taskBatchId},
              data: {
                callbackStatus: PeopleFinderBatchTaskCallBackStatus.completed,
              },
            });
          } else {
            this.peopleFinderNotification.send({
              message: `[callback error] url:${taskBatch?.callbackUrl}, batchId:${taskBatch.batchId}`,
            });
          }
          this.logger.log(
            'checkAndExecuteTaskBatchCallback: ' + JSON.stringify(res.data),
            this.loggerContext
          );
        })
        .catch(async e => {
          this.peopleFinderNotification.send({
            message: `[callback error] url:${taskBatch?.callbackUrl}, batchId:${taskBatch.batchId}`,
          });
          await this.prisma.peopleFinderTaskBatch.update({
            where: {id: taskBatchId},
            data: {
              callbackStatus: PeopleFinderBatchTaskCallBackStatus.error,
            },
          });
          this.logger.error(
            'checkAndExecuteTaskBatchCallback catch: ' +
              JSON.stringify({error: e}),
            this.loggerContext
          );
        });
    }
  }
}
