import {Injectable} from '@nestjs/common';
import {Prisma, Task} from '@prisma/client';
import {SqsService} from 'src/_aws/_sqs.service';
import {PrismaService} from '../../../_prisma/_prisma.service';

@Injectable()
export class TaskService {
  private prisma: PrismaService = new PrismaService();
  private sqsService: SqsService = new SqsService();

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
    const task = await this.prisma.task.create({
      data,
    });

    // Send the task to the SQS queue.
    await this.sqsService.sendMessage(task.sqsQueueUrl, task);
    return task;
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
