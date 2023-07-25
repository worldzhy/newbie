import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Prisma, Task} from '@prisma/client';
import {PrismaService} from '../../toolkit/prisma/prisma.service';
import {SqsService} from 'src/toolkit/aws/aws.sqs.service';

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

  async findUnique(params: Prisma.TaskFindUniqueArgs): Promise<Task | null> {
    return await this.prisma.task.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.TaskFindUniqueOrThrowArgs
  ): Promise<Task> {
    return await this.prisma.task.findUniqueOrThrow(params);
  }

  async findMany(params: Prisma.TaskFindManyArgs): Promise<Task[]> {
    return await this.prisma.task.findMany(params);
  }

  async create(params: Prisma.TaskCreateArgs): Promise<Task> {
    return await this.prisma.task.create(params);
  }

  async createMany(
    params: Prisma.TaskCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.task.createMany(params);
  }

  async update(params: Prisma.TaskUpdateArgs): Promise<Task> {
    return await this.prisma.task.update(params);
  }

  async updateMany(
    params: Prisma.TaskUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.task.updateMany(params);
  }

  async delete(params: Prisma.TaskDeleteArgs): Promise<Task> {
    return await this.prisma.task.delete(params);
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
