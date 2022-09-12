import {Inject, Injectable} from '@nestjs/common';
import {Prisma, Task, TaskConfiguration} from '@prisma/client';
import {SqsService} from '../../../_aws/_sqs.service';
import {PrismaService} from '../../../_prisma/_prisma.service';

@Injectable()
export class TaskService {
  private prisma: PrismaService = new PrismaService();
  private sqsService: SqsService;
  private config: TaskConfiguration;

  constructor(@Inject('TaskConfiguration') config: TaskConfiguration) {
    this.config = config;
    this.sqsService = new SqsService({queueUrl: config.sqsQueueUrl});
  }

  async sendOne(payload: object) {
    // [step 1] Send AWS SQS message.
    const output = await this.sqsService.sendMessage(payload);

    // [step 2] Save task record.
    return await this.prisma.task.create({
      data: {
        payload: payload,
        sqsMessageId: output.MessageId,
        sqsResponse: output as object,
        configurationId: this.config.id,
      },
    });
  }

  /**
   * Get a task.
   * @param {{
   *  where: Prisma.TaskWhereUniqueInput;
   * }} params
   * @returns {(Promise<Task | null>)}
   * @memberof TaskService
   */
  async findOne(params: {
    where: Prisma.TaskWhereUniqueInput;
  }): Promise<Task | null> {
    return await this.prisma.task.findUnique(params);
  }

  /**
   * Get many tasks.
   *
   * @param {{
   *     skip?: number;
   *     take?: number;
   *     where?: Prisma.TaskWhereInput;
   *     orderBy?: Prisma.TaskOrderByWithRelationAndSearchRelevanceInput;
   *     select?: Prisma.TaskSelect;
   *   }} params
   * @returns
   * @memberof TaskService
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.TaskWhereInput;
    orderBy?: Prisma.TaskOrderByWithRelationAndSearchRelevanceInput;
    select?: Prisma.TaskSelect;
  }) {
    const {skip, take, where, orderBy, select} = params;
    return await this.prisma.task.findMany({
      skip,
      take,
      where,
      orderBy,
      select,
    });
  }

  /**
   * Create a task.
   *
   * @param {Prisma.TaskCreateInput} data
   * @returns {Promise<Task>}
   * @memberof TaskService
   */
  async create(data: Prisma.TaskCreateInput): Promise<Task> {
    // Save a task in the database.
    return await this.prisma.task.create({
      data,
    });
  }

  /**
   * Update a task.
   *
   * @param {{
   *     where: Prisma.TaskWhereUniqueInput;
   *     data: Prisma.TaskUpdateInput;
   *   }} params
   * @returns {Promise<Task>}
   * @memberof TaskService
   */
  async update(params: {
    where: Prisma.TaskWhereUniqueInput;
    data: Prisma.TaskUpdateInput;
  }): Promise<Task> {
    const {where, data} = params;
    return await this.prisma.task.update({
      data,
      where,
    });
  }

  /**
   * Delete a task.
   *
   * @param {Prisma.TaskWhereUniqueInput} where
   * @returns {Promise<Task>}
   * @memberof TaskService
   */
  async delete(where: Prisma.TaskWhereUniqueInput): Promise<Task> {
    return await this.prisma.task.delete({
      where,
    });
  }

  /* End */
}
