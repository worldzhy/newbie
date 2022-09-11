import {Injectable} from '@nestjs/common';
import {Prisma, TaskGroup} from '@prisma/client';
import {PrismaService} from '../../../_prisma/_prisma.service';

@Injectable()
export class TaskGroupService {
  private prisma: PrismaService = new PrismaService();

  /**
   * Get a task group
   * @param {{
   *  where: Prisma.TaskGroupWhereUniqueInput;
   *  include?: Prisma.TaskGroupInclude;
   * }} params
   * @returns {(Promise<TaskGroup | null>)}
   * @memberof TaskGroupService
   */
  async findOne(params: {
    where: Prisma.TaskGroupWhereUniqueInput;
  }): Promise<TaskGroup | null> {
    return await this.prisma.taskGroup.findUnique(params);
  }

  /**
   * Get many task groups
   *
   * @param {{
   *     skip?: number;
   *     take?: number;
   *     where?: Prisma.TaskGroupWhereInput;
   *     orderBy?: Prisma.TaskGroupOrderByWithRelationAndSearchRelevanceInput;
   *     select?: Prisma.TaskGroupSelect;
   *   }} params
   * @returns
   * @memberof TaskGroupService
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.TaskGroupWhereInput;
    orderBy?: Prisma.TaskGroupOrderByWithRelationAndSearchRelevanceInput;
    select?: Prisma.TaskGroupSelect;
  }) {
    const {skip, take, where, orderBy, select} = params;
    return await this.prisma.taskGroup.findMany({
      skip,
      take,
      where,
      orderBy,
      select,
    });
  }

  /**
   * Check if exist
   *
   * @param {string} name
   * @returns
   * @memberof TaskGroupService
   */
  async checkExistence(name: string) {
    const count = await this.prisma.taskGroup.count({
      where: {name},
    });
    return count > 0 ? true : false;
  }

  /**
   * Create a task group
   *
   * @param {Prisma.TaskGroupCreateInput} data
   * @returns {Promise<TaskGroup>}
   * @memberof TaskGroupService
   */
  async create(data: Prisma.TaskGroupCreateInput): Promise<TaskGroup> {
    return await this.prisma.taskGroup.create({
      data,
    });
  }

  /**
   * Update a task group
   *
   * @param {{
   *     where: Prisma.TaskGroupWhereUniqueInput;
   *     data: Prisma.TaskGroupUpdateInput;
   *   }} params
   * @returns {Promise<TaskGroup>}
   * @memberof TaskGroupService
   */
  async update(params: {
    where: Prisma.TaskGroupWhereUniqueInput;
    data: Prisma.TaskGroupUpdateInput;
  }): Promise<TaskGroup> {
    const {where, data} = params;
    return await this.prisma.taskGroup.update({
      data,
      where,
    });
  }

  /**
   * Delete a task group
   *
   * @param {Prisma.TaskGroupWhereUniqueInput} where
   * @returns {Promise<TaskGroup>}
   * @memberof TaskGroupService
   */
  async delete(where: Prisma.TaskGroupWhereUniqueInput): Promise<TaskGroup> {
    return await this.prisma.taskGroup.delete({
      where,
    });
  }

  /* End */
}
