import {Injectable} from '@nestjs/common';
import {InjectQueue} from '@nestjs/bull';
import {JobStatus, Queue as BullQueue, Job} from 'bull';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {Prisma, Queue} from '@prisma/client';

export enum QueueName {
  DEFAULT = 'default',
}

@Injectable()
export class QueueService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QueueName.DEFAULT) private defaultQueue: BullQueue
  ) {}

  async create(args: Prisma.QueueCreateArgs): Promise<Queue> {
    return await this.prisma.queue.create(args);
  }

  async delete(args: Prisma.QueueDeleteArgs): Promise<Queue> {
    return await this.prisma.queue.delete(args);
  }

  async pause() {
    await this.defaultQueue.pause();
  }

  async resume() {
    await this.defaultQueue.resume();
  }

  async addJob(data: object): Promise<Job> {
    return await this.defaultQueue.add(data);
  }

  async getJobs(types: JobStatus[]) {
    return await this.defaultQueue.getJobs(types);
  }
}
