import {Injectable, BadRequestException} from '@nestjs/common';
import {HttpService} from '@nestjs/axios';
import {CustomLoggerService} from '@toolkit/logger/logger.service';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {
  PeopleFinderStatus,
  PeopleFinderPlatforms,
  PeopleFinderTaskStatus,
  PeopleFinderBranchTaskStatus,
  PeopleFinderBranchTaskCallBackStatus,
} from './constants';
import {CreateContactSearchTaskBranchReqDto} from './people-finder.dto';
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

  async createTaskBranch({
    branchId,
    peoples,
    callbackUrl,
  }: CreateContactSearchTaskBranchReqDto): Promise<{taskBranchId: number}> {
    const taskBranch = await this.prisma.peopleFinderTaskBranch.findFirst({
      where: {
        branchId,
      },
    });
    if (taskBranch) {
      throw new BadRequestException('BranchId already exists.');
    }
    const newTaskBranch = await this.prisma.peopleFinderTaskBranch.create({
      data: {
        branchId,
        status: PeopleFinderBranchTaskStatus.pending,
        callbackUrl,
        callbackStatus: PeopleFinderBranchTaskCallBackStatus.pending,
      },
    });
    await this.prisma.peopleFinderTask.createMany({
      data: peoples.map(item => ({
        ...item,
        status: PeopleFinderTaskStatus.pending,
        taskBranchId: newTaskBranch.id,
      })),
    });
    return {taskBranchId: newTaskBranch.id};
  }

  async getTaskBrancTasks(branchId: string) {
    const taskBranch = await this.prisma.peopleFinderTaskBranch.findFirst({
      where: {
        branchId,
      },
    });
    if (!taskBranch) {
      throw new BadRequestException('Branch not found.');
    }
    return await this.prisma.peopleFinderTask.findMany({
      where: {
        taskBranchId: taskBranch.id,
      },
    });
  }

  async checkTaskBranchStatus({
    branchId,
    taskBranchId,
  }: {
    branchId?: string;
    taskBranchId?: number;
  }) {
    const taskBranch = await this.prisma.peopleFinderTaskBranch.findFirst({
      where: taskBranchId
        ? {id: taskBranchId}
        : {
            branchId,
          },
    });
    if (!taskBranch) {
      throw new BadRequestException('BranchId not found.');
    }
    const total = await this.prisma.peopleFinderTask.count({
      where: {
        taskBranchId: taskBranch.id,
      },
    });
    const totalCompleted = await this.prisma.peopleFinderTask.count({
      where: {
        status: PeopleFinderTaskStatus.completed,
        taskBranchId: taskBranch.id,
      },
    });
    return {
      totalCompleted,
      total,
      completed: totalCompleted === total,
    };
  }

  async checkAndExecuteTaskBranchCallback(taskBranchId: number) {
    const {completed} = await this.checkTaskBranchStatus({
      taskBranchId: taskBranchId,
    });

    if (!completed) return;

    await this.prisma.peopleFinderTaskBranch.update({
      where: {id: taskBranchId},
      data: {
        status: PeopleFinderBranchTaskStatus.synchronizingData,
      },
    });

    const list = await this.prisma.peopleFinderTask.findMany({
      where: {taskBranchId},
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
          emails,
          phones,
        },
      });
    }

    const taskBranch = await this.prisma.peopleFinderTaskBranch.update({
      where: {id: taskBranchId},
      data: {
        status: PeopleFinderBranchTaskStatus.completed,
      },
    });

    if (taskBranch?.callbackUrl) {
      this.httpService.axiosRef
        .post<{branchId: string}, {status: number; data: string}>(
          taskBranch?.callbackUrl,
          {branchId: taskBranch.branchId}
        )
        .then(async res => {
          if (res.status === 200) {
            await this.prisma.peopleFinderTaskBranch.update({
              where: {id: taskBranchId},
              data: {
                callbackStatus: PeopleFinderBranchTaskCallBackStatus.completed,
              },
            });
          }
          this.logger.log(
            'checkAndExecuteTaskBranchCallback: ' + JSON.stringify(res),
            this.loggerContext
          );
        })
        .catch(async e => {
          await this.prisma.peopleFinderTaskBranch.update({
            where: {id: taskBranchId},
            data: {
              callbackStatus: PeopleFinderBranchTaskCallBackStatus.error,
            },
          });
          this.logger.error(
            'checkAndExecuteTaskBranchCallback catch: ' +
              JSON.stringify({error: e}),
            this.loggerContext
          );
        });
    }
  }
}
