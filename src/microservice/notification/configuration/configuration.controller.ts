import {Controller, Get, Post, Delete, Param, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {Product} from '@prisma/client';
import {NotificationConfigurationService} from './configuration.service';

@ApiTags('[Microservice] Notification / Configuration')
@ApiBearerAuth()
@Controller('notification')
export class NotificationConfigurationController {
  private notificationConfigurationService =
    new NotificationConfigurationService();

  /**
   * Get configurations.
   * @returns
   * @memberof NotificationConfigurationController
   */
  @Get('/configurations/list')
  async getNotificationConfigurations() {
    return this.notificationConfigurationService.findMany({where: {}});
  }

  /**
   * Get microservice with infrastructure stack.
   *
   * @param {string} configurationId
   * @returns
   * @memberof NotificationConfigurationController
   */
  @Get('/configurations/:configurationId')
  @ApiParam({
    name: 'configurationId',
    schema: {type: 'string'},
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getNotificationConfiguration(
    @Param('configurationId') configurationId: string
  ) {
    // [step 1] Get microservice database record.
    return await this.notificationConfigurationService.findOne({
      where: {id: configurationId},
    });
  }

  /**
   * Create a microservice.
   *
   * @param {{
   *   product: string;
   *   pinpointApplicationId: string
   * }} body
   * @returns
   * @memberof NotificationConfigurationController
   */
  @Post('/configurations')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create successfully',
        value: {
          product: Product.DATAPIPE_BATCH_PROCESSING,
          pinpointApplicationId: '1ljfowejflkasjf',
          pinpointFromAddress: 'henry@inceptionpad.com',
          pinpointSenderId: 'Inception',
        },
      },
    },
  })
  async createNotificationConfiguration(
    @Body()
    body: {
      product: Product;
      pinpointApplicationId: string;
      pinpointFromAddress: string;
      pinpointSenderId: string;
    }
  ) {
    // [step 1] Guard statement.
    const {product, pinpointApplicationId, pinpointFromAddress} = body;

    // [step 2] Create a microservice.
    return await this.notificationConfigurationService.create({
      product,
      pinpointApplicationId,
      pinpointFromAddress,
    });
  }

  /**
   * Update a microservice
   *
   * @param {string} configurationId
   * @param {{
   *   product?: string;
   *   pinpointApplicationId?: string;
   *   pinpointFromAddress?: string;
   *   pinpointSenderId?: string;
   * }} body
   * @returns
   * @memberof NotificationConfigurationController
   */
  @Post('/configurations/:configurationId')
  @ApiParam({
    name: 'configurationId',
    schema: {type: 'string'},
    example: 'e67c94cf-ee4f-4dfd-8819-fcb08b4a2e3d',
  })
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update pinpointFromAddress',
        value: {
          pinpointFromAddress: 'henry@inceptionpad.com',
        },
      },
    },
  })
  async updateNotificationConfiguration(
    @Param('configurationId') configurationId: string,
    @Body()
    body: {
      pinpointApplicationId?: string;
      pinpointFromAddress?: string;
      pinpointSenderId?: string;
    }
  ) {
    return await this.notificationConfigurationService.update({
      where: {id: configurationId},
      data: body,
    });
  }

  /**
   * Delete a microservice.
   *
   * @param {string} configurationId
   * @returns
   * @memberof NotificationConfigurationController
   */
  @Delete('/configurations/:configurationId')
  @ApiParam({
    name: 'configurationId',
    schema: {type: 'string'},
    example: 'ff337f2d-d3a5-4f2e-be16-62c75477b605',
  })
  async deleteNotificationConfiguration(
    @Param('configurationId')
    configurationId: string
  ) {
    return await this.notificationConfigurationService.delete({
      id: configurationId,
    });
  }

  /* End */
}
