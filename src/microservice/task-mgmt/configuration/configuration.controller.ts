import {Controller, Get, Post, Delete, Param, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {Product} from '@prisma/client';
import {TaskConfigurationService} from './configuration.service';

@ApiTags('[Microservice] Task Management / Configuration')
@ApiBearerAuth()
@Controller('task-management')
export class TaskConfigurationController {
  private microserviceService = new TaskConfigurationService();

  /**
   * Get configurations.
   * @returns
   * @memberof TaskConfigurationController
   */
  @Get('/configurations/list')
  async getTaskConfigurations() {
    return this.microserviceService.findMany({where: {}});
  }

  /**
   * Get microservice with infrastructure stack.
   *
   * @param {string} configurationId
   * @returns
   * @memberof TaskConfigurationController
   */
  @Get('/configurations/:configurationId')
  @ApiParam({
    name: 'configurationId',
    schema: {type: 'string'},
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getTaskConfiguration(
    @Param('configurationId') configurationId: string
  ) {
    // [step 1] Get microservice database record.
    return await this.microserviceService.findOne({
      where: {id: configurationId},
    });
  }

  /**
   * Create a microservice.
   *
   * @param {{
   *   product: string;
   *   sqsQueueUrl: string
   * }} body
   * @returns
   * @memberof TaskConfigurationController
   */
  @Post('/configurations')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create successfully',
        value: {
          product: Product.DATAPIPE_BATCH_PROCESSING,
          sqsQueueUrl: 'http://sjflajlfas',
        },
      },
    },
  })
  async createTaskConfiguration(
    @Body()
    body: {
      product: Product;
      sqsQueueUrl: string;
    }
  ) {
    // [step 1] Guard statement.
    const {product, sqsQueueUrl} = body;

    // [step 2] Create a microservice.
    return await this.microserviceService.create({
      product,
      sqsQueueUrl,
    });
  }

  /**
   * Update a microservice
   *
   * @param {string} configurationId
   * @param {{
   *   name: string;
   * }} body
   * @returns
   * @memberof TaskConfigurationController
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
        summary: '1. Update name',
        value: {
          sqsQueueUrl: 'http://lafjsjf',
        },
      },
    },
  })
  async updateTaskConfiguration(
    @Param('configurationId') configurationId: string,
    @Body()
    body: {sqsQueueUrl: string}
  ) {
    const {sqsQueueUrl} = body;

    return await this.microserviceService.update({
      where: {id: configurationId},
      data: {sqsQueueUrl},
    });
  }

  /**
   * Delete a microservice.
   *
   * @param {string} configurationId
   * @returns
   * @memberof TaskConfigurationController
   */
  @Delete('/configurations/:configurationId')
  @ApiParam({
    name: 'configurationId',
    schema: {type: 'string'},
    example: 'ff337f2d-d3a5-4f2e-be16-62c75477b605',
  })
  async deleteTaskConfiguration(
    @Param('configurationId')
    configurationId: string
  ) {
    return await this.microserviceService.delete({id: configurationId});
  }

  /* End */
}
