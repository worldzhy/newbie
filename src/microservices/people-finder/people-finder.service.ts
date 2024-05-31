import {Injectable, BadRequestException} from '@nestjs/common';
import {HttpService} from '@nestjs/axios';
import {CustomLoggerService} from '@toolkit/logger/logger.service';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {
  PeopleFinderStatus,
  PeopleFinderPlatforms,
  PeopleFinderTaskStatus,
  PeopleFinderBatchTaskStatus,
  PeopleFinderBatchTaskCallBackStatus,
} from './constants';
import {CreateContactSearchTaskBatchReqDto} from './people-finder.dto';
export * from './constants';

@Injectable()
export class PeopleFinderService {
  private loggerContext = 'PeopleFinderService';

  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CustomLoggerService,
    private httpService: HttpService
  ) {}

  async isExist({
    platform,
    userSource,
    userId,
  }: {
    platform: PeopleFinderPlatforms;
    userSource: string;
    userId: string;
  }): Promise<number> {
    const res = await this.prisma.peopleFinderCallThirdParty.findFirst({
      where: {
        status: {
          notIn: [
            PeopleFinderStatus.deleted,
            PeopleFinderStatus.parameterError,
          ],
        },
        source: platform,
        userSource,
        userId,
      },
    });
    if (res) return res.id;
    return 0;
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

  async getTaskBrancTasks(batchId: string) {
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

      // get emails and phones
      let emails: string[] = [];
      let phones: string[] = [];
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
          phones = item.phones as string[];
        }
      });

      await this.prisma.peopleFinderTask.update({
        where: {id: task.id},
        data: {
          emails: Array.from(new Set(emails)),
          phones: Array.from(new Set(phones)),
        },
      });
    }

    const taskBatch = await this.prisma.peopleFinderTaskBatch.update({
      where: {id: taskBatchId},
      data: {
        status: PeopleFinderBatchTaskStatus.completed,
      },
    });

    if (taskBatch?.callbackUrl) {
      this.httpService.axiosRef
        .post<{batchId: string}, {status: number; data: string}>(
          taskBatch?.callbackUrl,
          {batchId: taskBatch.batchId}
        )
        .then(async res => {
          if (res.status === 200) {
            await this.prisma.peopleFinderTaskBatch.update({
              where: {id: taskBatchId},
              data: {
                callbackStatus: PeopleFinderBatchTaskCallBackStatus.completed,
              },
            });
          }
          this.logger.log(
            'checkAndExecuteTaskBatchCallback: ' + JSON.stringify(res),
            this.loggerContext
          );
        })
        .catch(async e => {
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
