import {Injectable} from '@nestjs/common';
import {InjectQueue} from '@nestjs/bull';
import {JobOptions, JobStatus, Queue} from 'bull';

export enum QueueName {
  DEFAULT = 'default',
}

@Injectable()
export class QueueService {
  constructor(@InjectQueue(QueueName.DEFAULT) private queue: Queue) {}

  async add(params: {name: string; data: any; options?: JobOptions}) {
    return await this.queue.add(params.name, params.data, params.options);
  }

  async list(types: JobStatus[]) {
    return await this.queue.getJobs(types);
  }

  async pause() {
    await this.queue.pause();
  }

  async resume() {
    await this.queue.resume();
  }
}
