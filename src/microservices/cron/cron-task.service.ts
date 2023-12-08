import {Injectable} from '@nestjs/common';
import {SchedulerRegistry} from '@nestjs/schedule';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class CronTaskService {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private readonly prisma: PrismaService
  ) {}

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
