import {
  SQSClient,
  SendMessageCommand,
  SendMessageCommandOutput,
} from '@aws-sdk/client-sqs';
import {Injectable} from '@nestjs/common';
import {Prisma, Task, TaskType} from '@prisma/client';
import {PrismaService} from '../../toolkits/prisma/prisma.service';
import {getAwsSqsConfig} from '../../toolkits/aws/sqs.config';

@Injectable()
export class TaskService {
  private prisma: PrismaService = new PrismaService();
  private client: SQSClient;

  constructor() {
    this.client = new SQSClient({
      credentials: {
        accessKeyId: getAwsSqsConfig().accessKeyId,
        secretAccessKey: getAwsSqsConfig().secretAccessKey,
      },
      region: getAwsSqsConfig().region,
    });
  }

  async findUnique(params: Prisma.TaskFindUniqueArgs): Promise<Task | null> {
    return await this.prisma.task.findUnique(params);
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

  async sendTask(params: {
    type: TaskType;
    group: string;
    payload: object;
  }): Promise<Task> {
    // [step 1] Send queue message.
    const commandInput = {
      QueueUrl: getAwsSqsConfig().sqsTaskQueueUrl,
      MessageBody: JSON.stringify(params.payload),
    };

    const output: SendMessageCommandOutput = await this.client.send(
      new SendMessageCommand(commandInput)
    );

    // [step 2] Save task record.
    return await this.prisma.task.create({
      data: {
        type: params.type,
        group: params.group,
        payload: params.payload,
        sqsMessageId: output.MessageId,
        sqsResponse: output as object,
      },
    });
  }

  /* End */
}
