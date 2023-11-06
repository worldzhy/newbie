import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Prisma, QueueTask} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {SqsService} from '@toolkit/aws/aws.sqs.service';
import {QueueService} from './queue.service';

@Injectable()
export class QueueTaskService {
  private awsSqsQueueUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
    private readonly sqsService: SqsService
  ) {
    this.awsSqsQueueUrl = this.configService.getOrThrow<string>(
      'microservice.task.awsSqsQueueUrl'
    )!;
  }

  async findUniqueOrThrow(
    args: Prisma.QueueTaskFindUniqueOrThrowArgs
  ): Promise<QueueTask> {
    return await this.prisma.queueTask.findUniqueOrThrow(args);
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

  async create(args: Prisma.QueueTaskCreateArgs): Promise<QueueTask> {
    return await this.prisma.queueTask.create(args);
  }

  async createMany(
    args: Prisma.QueueTaskCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.queueTask.createMany(args);
  }

  async update(args: Prisma.QueueTaskUpdateArgs): Promise<QueueTask> {
    return await this.prisma.queueTask.update(args);
  }

  async updateMany(
    args: Prisma.QueueTaskUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.queueTask.updateMany(args);
  }

  async delete(args: Prisma.QueueTaskDeleteArgs): Promise<QueueTask> {
    return await this.prisma.queueTask.delete(args);
  }

  async add2bull(task: QueueTask): Promise<QueueTask> {
    // [step 1] Add to queue.
    const output = await this.queueService.add({
      name: task.name,
      data: task.data,
    });

    // [step 2] Update task record.
    return await this.prisma.queueTask.update({
      where: {id: task.id},
      data: {bullJobId: output.id as string},
    });
  }

  async send2aws(task: QueueTask): Promise<QueueTask> {
    // [step 1] Send queue message.
    const output = await this.sqsService.sendMessage({
      queueUrl: this.awsSqsQueueUrl,
      body: task.data as object,
    });

    // [step 2] Update task record.
    return await this.prisma.queueTask.update({
      where: {id: task.id},
      data: {
        sqsMessageId: output.MessageId,
        sqsResponse: output as object,
      },
    });
  }
  /* End */
}
