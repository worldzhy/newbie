import {Injectable} from '@nestjs/common';
import {SchedulerRegistry} from '@nestjs/schedule';
import {CronJob, CronCommand} from 'cron';

@Injectable()
export class TimeoutService {
  constructor(private schedulerRegistry: SchedulerRegistry) {}

  listCronJobs(): Map<string, CronJob> {
    return this.schedulerRegistry.getCronJobs();
  }

  addCronJob(params: {name: string; expression: string; command: CronCommand}) {
    const job = new CronJob(params.expression, params.command);
    this.schedulerRegistry.addCronJob(params.name, job);
  }

  startCronJob(name: string) {
    const job = this.schedulerRegistry.getCronJob(name);
    job.start();
  }

  stopCronJob(name: string) {
    const job = this.schedulerRegistry.getCronJob(name);
    job.stop();
  }

  deleteCron(name: string) {
    this.schedulerRegistry.deleteCronJob(name);
  }

  /* End */
}
