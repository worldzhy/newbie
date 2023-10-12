import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Prisma, Task} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {SqsService} from '@toolkit/aws/aws.sqs.service';

@Injectable()
export class TaskService {
  private awsSqsQueueUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly sqsService: SqsService
  ) {
    this.awsSqsQueueUrl = this.configService.getOrThrow<string>(
      'microservice.task.awsSqsQueueUrl'
    )!;
  }

  async findUniqueOrThrow(
    args: Prisma.TaskFindUniqueOrThrowArgs
  ): Promise<Task> {
    return await this.prisma.task.findUniqueOrThrow(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.TaskFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.Task,
      pagination,
      findManyArgs,
    });
  }

  async create(args: Prisma.TaskCreateArgs): Promise<Task> {
    return await this.prisma.task.create(args);
  }

  async createMany(
    args: Prisma.TaskCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.task.createMany(args);
  }

  async update(args: Prisma.TaskUpdateArgs): Promise<Task> {
    return await this.prisma.task.update(args);
  }

  async updateMany(
    args: Prisma.TaskUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.task.updateMany(args);
  }

  async delete(args: Prisma.TaskDeleteArgs): Promise<Task> {
    return await this.prisma.task.delete(args);
  }

  async send2queue(taskId: number): Promise<Task> {
    // [step 1] Get task.
    const task = await this.prisma.task.findUniqueOrThrow({
      where: {id: taskId},
    });

    // [step 2] Send queue message.
    const output = await this.sqsService.sendMessage({
      queueUrl: this.awsSqsQueueUrl,
      body: task.payload as object,
    });

    // [step 3] Update task record.
    return await this.prisma.task.update({
      where: {id: taskId},
      data: {
        sqsMessageId: output.MessageId,
        sqsResponse: output as object,
      },
    });
  }
  /* End */
}
