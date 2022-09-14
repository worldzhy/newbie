import {Injectable} from '@nestjs/common';
import {Prisma, Task, TaskType} from '@prisma/client';
import {getAwsConfig} from '../../_config/_aws.config';
import {SqsService} from '../../_aws/_sqs.service';
import {PrismaService} from '../../_prisma/_prisma.service';

@Injectable()
export class TaskService {
  private prisma: PrismaService = new PrismaService();
  private sqsService = new SqsService();

  async findUnique(params: Prisma.TaskFindUniqueArgs): Promise<Task | null> {
    return await this.prisma.task.findUnique(params);
  }

  async findMany(params: Prisma.TaskFindManyArgs): Promise<Task[]> {
    return await this.prisma.task.findMany(params);
  }

  async create(data: Prisma.TaskCreateInput): Promise<Task> {
    // Save a task in the database.
    return await this.prisma.task.create({
      data,
    });
  }

  async update(params: Prisma.TaskUpdateArgs): Promise<Task> {
    return await this.prisma.task.update(params);
  }

  async delete(params: Prisma.TaskDeleteArgs): Promise<Task> {
    return await this.prisma.task.delete(params);
  }

  async sendOne({type, payload}: {type: TaskType; payload: object}) {
    // [step 1] Send AWS SQS message.
    const output = await this.sqsService.sendMessage(
      getAwsConfig().sqsTaskQueueUrl!,
      payload
    );

    // [step 2] Save task record.
    return await this.prisma.task.create({
      data: {
        type: type,
        payload: payload,
        sqsMessageId: output.MessageId,
        sqsResponse: output as object,
      },
    });
  }

  /* End */
}
