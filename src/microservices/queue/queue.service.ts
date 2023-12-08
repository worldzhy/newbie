import {Injectable} from '@nestjs/common';
import {InjectQueue} from '@nestjs/bull';
import {JobStatus, Queue as BullQueue, Job, JobStatusClean} from 'bull';

export enum QueueName {
  DEFAULT = 'default',
}

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue(QueueName.DEFAULT) private defaultQueue: BullQueue
  ) {}

  async pause() {
    await this.defaultQueue.pause();
  }

  async resume() {
    await this.defaultQueue.resume();
  }

  async empty() {
    await this.defaultQueue.empty();
  }

  async clean(grace: number, status?: JobStatusClean, limit?: number) {
    await this.defaultQueue.clean(grace, status, limit);
  }

  async addJob(data: object): Promise<Job> {
    return await this.defaultQueue.add(data, {delay: 1000}); // Delay the start of a job for 1 second.
  }

  async addJobs(dataArray: object[]): Promise<Job[]> {
    return await this.defaultQueue.addBulk(
      dataArray.map(data => {
        return {data, delay: 1000};
      })
    ); // Delay the start of a job for 1 second.
  }

  async getJobs(types: JobStatus[]) {
    return await this.defaultQueue.getJobs(types);
  }
}
