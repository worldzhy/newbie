import {Injectable} from '@nestjs/common';
import {SchedulerRegistry} from '@nestjs/schedule';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {CronJob} from 'cron';

@Injectable()
export class CronTaskService {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private readonly prisma: PrismaService
  ) {}

  list() {
    const tasksMap = this.schedulerRegistry.getCronJobs();
    const tasks: {
      name: string;
      cronTime: string;
      lastDate: Date | null;
      nextDate: Date | string;
      status: string;
    }[] = [];

    tasksMap.forEach((value, key) => {
      let nextDate: Date | string;
      try {
        nextDate = value.nextDate().toJSDate();
      } catch (e) {
        nextDate = 'error: next fire date is in the past!';
      }
      value.running;
      tasks.push({
        name: key,
        cronTime: value.cronTime.toString(),
        lastDate: value.lastDate(),
        nextDate,
        status: value.running ? 'running' : 'stopped',
      });
    });

    return tasks;
  }

  async create(params: {name: string; cronTime: string}) {
    const cron = await this.prisma.cronTask.create({
      data: {name: params.name, cronTime: params.cronTime},
    });

    const job = new CronJob(params.cronTime, async () => {
      console.log(`time (${params.cronTime}) for job ${params.name} to run!`);
    });
    this.schedulerRegistry.addCronJob(params.name, job);

    return cron;
  }

  async delete(id: number) {
    const cron = await this.prisma.cronTask.findUniqueOrThrow({
      where: {id: id},
    });

    this.schedulerRegistry.deleteCronJob(cron.name);

    return cron;
  }

  async start(cronTaskId: number) {
    const cronTask = await this.prisma.cronTask.findUniqueOrThrow({
      where: {id: cronTaskId},
    });

    this.schedulerRegistry.getCronJob(cronTask.name).start();
  }

  async stop(cronTaskId: number) {
    const cronTask = await this.prisma.cronTask.findUniqueOrThrow({
      where: {id: cronTaskId},
    });

    this.schedulerRegistry.getCronJob(cronTask.name).stop();
  }

  /* End */
}
