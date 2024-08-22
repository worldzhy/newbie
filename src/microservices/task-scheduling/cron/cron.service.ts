import {Injectable} from '@nestjs/common';
import {SchedulerRegistry} from '@nestjs/schedule';
import {PrismaService} from '@framework/prisma/prisma.service';
import {CronJob} from 'cron';

@Injectable()
export class CronTaskService {
  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private readonly prisma: PrismaService
  ) {}

  async start(cronTaskId: number) {
    const cron = await this.prisma.cronTask.update({
      where: {id: cronTaskId},
      data: {running: true},
    });

    try {
      this.schedulerRegistry.getCronJob(cron.name).start();
    } catch (error) {
      const job = new CronJob(cron.cronTime, async () => {
        console.log(`time (${cron.cronTime}) for job ${cron.name} to run!`);
      });
      this.schedulerRegistry.addCronJob(cron.name, job);
      job.start();
    }
  }

  async stop(cronTaskId: number) {
    const cronTask = await this.prisma.cronTask.update({
      where: {id: cronTaskId},
      data: {running: false},
    });

    this.schedulerRegistry.getCronJob(cronTask.name).stop();
  }

  async delete(id: number) {
    const cron = await this.prisma.cronTask.delete({where: {id: id}});

    try {
      this.schedulerRegistry.deleteCronJob(cron.name);
    } catch (error) {
      console.log(error);
    }

    return cron;
  }

  async monitorAndRecover() {
    const crons = await this.prisma.cronTask.findMany();
    const cronsInMemory = this.schedulerRegistry.getCronJobs();

    for (let i = 0; i < crons.length; i++) {
      const cron = crons[i];
      const cronInMemory = cronsInMemory.get(cron.name);

      if (cronInMemory) {
        if (cron.running !== cronInMemory.running) {
          if (cron.running) {
            cronInMemory.start();
          } else {
            cronInMemory.stop;
          }
        } else {
          // Do nothing.
        }
      } else {
        const job = new CronJob(cron.cronTime, async () => {
          console.log(`time (${cron.cronTime}) for job ${cron.name} to run!`);
        });
        this.schedulerRegistry.addCronJob(cron.name, job);
        if (cron.running) {
          job.start();
        } else {
          job.stop();
        }
      }
    }
  }

  runningInfo(name: string) {
    let cron: CronJob;
    try {
      cron = this.schedulerRegistry.getCronJob(name);
    } catch (error) {
      return null;
    }

    let nextDate: Date | string;
    try {
      nextDate = cron.nextDate().toJSDate();
    } catch (e) {
      nextDate = 'error: next fire date is in the past!';
    }

    return {
      name,
      cronTime: cron.cronTime.toString(),
      running: cron.running,
      lastDate: cron.lastDate(),
      nextDate,
    };
  }

  /* End */
}
