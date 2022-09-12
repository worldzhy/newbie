import {Injectable} from '@nestjs/common';
import {Prisma, NotificationConfiguration, Product} from '@prisma/client';
import {PrismaService} from '../../../_prisma/_prisma.service';

@Injectable()
export class NotificationConfigurationService {
  private prisma: PrismaService = new PrismaService();

  async defaultConfiguration() {
    return await this.prisma.notificationConfiguration.findUnique({
      where: {
        product: Product.DEFAULT,
      },
    });
  }

  async findOne(params: {
    where: Prisma.NotificationConfigurationWhereUniqueInput;
  }): Promise<NotificationConfiguration | null> {
    return await this.prisma.notificationConfiguration.findUnique(params);
  }

  async findMany(params: {where: Prisma.NotificationConfigurationWhereInput}) {
    return await this.prisma.notificationConfiguration.findMany(params);
  }

  /**
   * Check if exist
   *
   * @param {string} id
   * @returns
   * @memberof NotificationConfigurationService
   */
  async checkExistence(id: string) {
    const count = await this.prisma.notificationConfiguration.count({
      where: {id},
    });
    return count > 0 ? true : false;
  }

  /**
   * Create a notification configuration.
   *
   * @param {Prisma.NotificationConfigurationCreateInput} data
   * @returns {Promise<NotificationConfiguration>}
   * @memberof NotificationConfigurationService
   */
  async create(
    data: Prisma.NotificationConfigurationCreateInput
  ): Promise<NotificationConfiguration> {
    try {
      return await this.prisma.notificationConfiguration.create({
        data,
      });
    } catch (error) {
      return error;
    }
  }

  /**
   * Update a notification configuration.
   *
   * @param {{
   *     where: Prisma.NotificationConfigurationWhereUniqueInput;
   *     data: Prisma.NotificationConfigurationUpdateInput;
   *   }} params
   * @returns {Promise<NotificationConfiguration>}
   * @memberof NotificationConfigurationService
   */
  async update(params: {
    where: Prisma.NotificationConfigurationWhereUniqueInput;
    data: Prisma.NotificationConfigurationUpdateInput;
  }): Promise<NotificationConfiguration> {
    const {where, data} = params;
    return await this.prisma.notificationConfiguration.update({
      data,
      where,
    });
  }

  /**
   * Delete a notification configuration.
   *
   * @param {Prisma.NotificationConfigurationWhereUniqueInput} where
   * @returns {Promise<NotificationConfiguration>}
   * @memberof NotificationConfigurationService
   */
  async delete(
    where: Prisma.NotificationConfigurationWhereUniqueInput
  ): Promise<NotificationConfiguration> {
    return await this.prisma.notificationConfiguration.delete({
      where,
    });
  }

  /* End */
}
