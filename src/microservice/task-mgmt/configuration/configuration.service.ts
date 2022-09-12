import {Injectable} from '@nestjs/common';
import {Prisma, Product, TaskConfiguration} from '@prisma/client';
import {PrismaService} from '../../../_prisma/_prisma.service';

@Injectable()
export class TaskConfigurationService {
  private prisma: PrismaService = new PrismaService();

  async defaultConfiguration() {
    return await this.prisma.taskConfiguration.findUnique({
      where: {
        product: Product.DEFAULT,
      },
    });
  }

  async findOne(params: {
    where: Prisma.TaskConfigurationWhereUniqueInput;
  }): Promise<TaskConfiguration | null> {
    return await this.prisma.taskConfiguration.findUnique(params);
  }

  async findMany(params: {where: Prisma.TaskConfigurationWhereInput}) {
    return await this.prisma.taskConfiguration.findMany(params);
  }

  /**
   * Check if exist
   *
   * @param {string} id
   * @returns
   * @memberof TaskConfigurationService
   */
  async checkExistence(id: string) {
    const count = await this.prisma.taskConfiguration.count({
      where: {id},
    });
    return count > 0 ? true : false;
  }

  /**
   * Create a task configuration.
   *
   * @param {Prisma.TaskConfigurationCreateInput} data
   * @returns {Promise<TaskConfiguration>}
   * @memberof TaskConfigurationService
   */
  async create(
    data: Prisma.TaskConfigurationCreateInput
  ): Promise<TaskConfiguration> {
    try {
      return await this.prisma.taskConfiguration.create({
        data,
      });
    } catch (error) {
      return error;
    }
  }

  /**
   * Update a task configuration.
   *
   * @param {{
   *     where: Prisma.TaskConfigurationWhereUniqueInput;
   *     data: Prisma.TaskConfigurationUpdateInput;
   *   }} params
   * @returns {Promise<TaskConfiguration>}
   * @memberof TaskConfigurationService
   */
  async update(params: {
    where: Prisma.TaskConfigurationWhereUniqueInput;
    data: Prisma.TaskConfigurationUpdateInput;
  }): Promise<TaskConfiguration> {
    const {where, data} = params;
    return await this.prisma.taskConfiguration.update({
      data,
      where,
    });
  }

  /**
   * Delete a task configuration.
   *
   * @param {Prisma.TaskConfigurationWhereUniqueInput} where
   * @returns {Promise<TaskConfiguration>}
   * @memberof TaskConfigurationService
   */
  async delete(
    where: Prisma.TaskConfigurationWhereUniqueInput
  ): Promise<TaskConfiguration> {
    return await this.prisma.taskConfiguration.delete({
      where,
    });
  }

  /* End */
}
