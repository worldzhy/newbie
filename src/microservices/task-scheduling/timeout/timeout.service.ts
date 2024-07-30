import {Injectable} from '@nestjs/common';
import {SchedulerRegistry} from '@nestjs/schedule';

@Injectable()
export class TimeoutTaskService {
  constructor(private schedulerRegistry: SchedulerRegistry) {}

  listTasks() {
    return this.schedulerRegistry.getTimeouts();
  }

  getTask(name: string) {
    try {
      return this.schedulerRegistry.getTimeout(name);
    } catch (error) {
      return null;
    }
  }

  createTask(params: {
    name: string;
    milliseconds: number;
    callback: () => Promise<void>;
  }) {
    const timeout = setTimeout(params.callback, params.milliseconds);
    this.schedulerRegistry.addTimeout(params.name, timeout);

    console.info(
      `Timeout task ${
        params.name
      } has been created. It will be triggered after ${
        params.milliseconds / 1000
      } seconds.`
    );
  }

  deleteTask(name: string) {
    this.schedulerRegistry.deleteTimeout(name);
    console.warn(`Timeout task ${name} has been deleted.`);
  }

  /* End */
}
