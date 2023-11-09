import {Injectable} from '@nestjs/common';
import {InjectQueue} from '@nestjs/bull';
import {JobOptions, JobStatus, Queue} from 'bull';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {Prisma, QueueTask} from '@prisma/client';

export enum QueueName {
  DEFAULT = 'default',
}

@Injectable()
export class QueueService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QueueName.DEFAULT) private queue: Queue
  ) {}

  async addTask(args: Prisma.QueueTaskCreateArgs): Promise<QueueTask> {
    // [step 1] Add to queue.
    const output = await this.queue.add({...(args.data.payload as object)}, {});
    args.data.bullJobId = output.id as string;

    // [step 2] Create task record.
    return await this.prisma.queueTask.create(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.QueueTaskFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.QueueTask,
      pagination,
      findManyArgs,
    });
  }

  async listTasks(types: JobStatus[]) {
    return await this.queue.getJobs(types);
  }

  async deleteTask(args: Prisma.QueueTaskDeleteArgs): Promise<QueueTask> {
    return await this.prisma.queueTask.delete(args);
  }

  async pause() {
    await this.queue.pause();
  }

  async resume() {
    await this.queue.resume();
  }
}
