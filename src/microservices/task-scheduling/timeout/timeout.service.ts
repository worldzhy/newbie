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

    console.log('A timeout task ' + params.name + ' has been created.');
  }

  deleteTask(name: string) {
    this.schedulerRegistry.deleteTimeout(name);
    console.warn(`A timeout task ${name} has been deleted.`);
  }

  /* End */
}
