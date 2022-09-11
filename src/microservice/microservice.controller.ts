import {Controller, Get, Post, Delete, Param, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {MicroserviceService} from './microservice.service';

@ApiTags('Microservice')
@ApiBearerAuth()
@Controller('microservices')
export class MicroserviceController {
  private microserviceService = new MicroserviceService();

  /**
   * Get microservices.
   * @returns
   * @memberof MicroserviceController
   */
  @Get('/list')
  async getMicroservices() {
    return this.microserviceService.findMany({where: {}});
  }

  /**
   * Get microservice with infrastructure stack.
   *
   * @param {string} microserviceId
   * @returns
   * @memberof MicroserviceController
   */
  @Get('/:microserviceId')
  @ApiParam({
    name: 'microserviceId',
    schema: {type: 'string'},
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getMicroservice(@Param('microserviceId') microserviceId: string) {
    // [step 1] Get microservice database record.
    return await this.microserviceService.findOne({
      where: {id: microserviceId},
    });
  }

  /**
   * Create a microservice.
   *
   * @param {{
   *   name: string;
   * }} body
   * @returns
   * @memberof MicroserviceController
   */
  @Post('microservices')
  @ApiBody({
    description: 'Enjoy coding :)',
    examples: {
      a: {
        summary: '1. Create successfully',
        value: {
          name: 'Email Outreaching',
        },
      },
    },
  })
  async createMicroservice(
    @Body()
    body: {
      name: string;
    }
  ) {
    // [step 1] Guard statement.

    // [step 2] Create a microservice.
    return await this.microserviceService.create({
      name: body.name,
    });
  }

  /**
   * Update a microservice
   *
   * @param {string} microserviceId
   * @param {{
   *   name: string;
   * }} body
   * @returns
   * @memberof MicroserviceController
   */
  @Post('/:microserviceId')
  @ApiParam({
    name: 'microserviceId',
    schema: {type: 'string'},
    example: 'e67c94cf-ee4f-4dfd-8819-fcb08b4a2e3d',
  })
  @ApiBody({
    description: 'Enjoy coding :)',
    examples: {
      a: {
        summary: '1. Update name',
        value: {
          name: 'FileManager',
        },
      },
    },
  })
  async updateMicroservice(
    @Param('microserviceId') microserviceId: string,
    @Body()
    body: {name: string}
  ) {
    const {name} = body;
    return await this.microserviceService.update({
      where: {id: microserviceId},
      data: {name},
    });
  }

  /**
   * Delete a microservice.
   *
   * @param {string} microserviceId
   * @returns
   * @memberof MicroserviceController
   */
  @Delete('/:microserviceId')
  @ApiParam({
    name: 'microserviceId',
    schema: {type: 'string'},
    example: 'ff337f2d-d3a5-4f2e-be16-62c75477b605',
  })
  async deleteMicroservice(
    @Param('microserviceId')
    microserviceId: string
  ) {
    return await this.microserviceService.delete({id: microserviceId});
  }

  /* End */
}
