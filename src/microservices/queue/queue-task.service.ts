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

  async delete(args: Prisma.QueueTaskDeleteArgs): Promise<QueueTask> {
    return await this.prisma.queueTask.delete(args);
  }

  async add2queue(args: Prisma.QueueTaskCreateArgs): Promise<QueueTask> {
    // [step 1] Add to queue.
    const output = await this.queueService.add({
      name: args.data.name,
      data: args.data.data,
    });
    args.data.bullJobId = output.id as string;

    // [step 2] Create task record.
    return await this.prisma.queueTask.create(args);
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
