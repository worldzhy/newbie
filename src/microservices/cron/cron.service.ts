import {Injectable} from '@nestjs/common';
import {SchedulerRegistry} from '@nestjs/schedule';

@Injectable()
export class CronService {
  constructor(private schedulerRegistry: SchedulerRegistry) {}

  list() {
    return this.schedulerRegistry.getCronJobs();
  }

  /* End */
}
