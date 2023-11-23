import {Injectable} from '@nestjs/common';
import {SchedulerRegistry} from '@nestjs/schedule';
import {Prisma, CronTask} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class CronTaskService {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private readonly prisma: PrismaService
  ) {}

  async findUniqueOrThrow(
    args: Prisma.CronTaskFindUniqueOrThrowArgs
  ): Promise<CronTask> {
    return await this.prisma.cronTask.findUniqueOrThrow(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.CronTaskFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.CronTask,
      pagination,
      findManyArgs,
    });
  }

  async delete(args: Prisma.CronTaskDeleteArgs): Promise<CronTask> {
    const cronTask = await this.prisma.cronTask.delete(args);
    this.schedulerRegistry.deleteCronJob(cronTask.name);
    return cronTask;
  }

  async start(cronTaskId: number) {
    const cronTask = await this.prisma.cronTask.findUniqueOrThrow({
      where: {id: cronTaskId},
    });
    const job = this.schedulerRegistry.getCronJob(cronTask.name);
    job.start();
  }

  async stop(cronTaskId: number) {
    const cronTask = await this.prisma.cronTask.findUniqueOrThrow({
      where: {id: cronTaskId},
    });
    const job = this.schedulerRegistry.getCronJob(cronTask.name);
    job.stop();
  }

  /* End */
}
