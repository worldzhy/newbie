import {Controller, Get, Post, Param, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {} from '@prisma/client';
import {DatapipeColumnMappingService} from './column-mapping.service';

@ApiTags('App / DatapipeColumnMapping')
@ApiBearerAuth()
@Controller('datapipe-column-mappings')
export class DatapipeColumnMappingController {
  private datapipeColumnMappingService = new DatapipeColumnMappingService();

  /**
   * Get datapipe column mappings by datapipe id
   *
   * @param {string} datapipeId
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof DatapipeColumnMappingController
   */
  @Get('/datapipes/:datapipeId')
  @ApiParam({
    name: 'datapipeId',
    schema: {type: 'string'},
    description: 'The uuid of the datapipe.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getDatapipeColumnMapping(
    @Param('datapipeId') datapipeId: string
  ): Promise<{data: object | null; err: object | null}> {
    const result = await this.datapipeColumnMappingService.findMany({
      where: {
        datapipeId: datapipeId,
      },
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Get datapipeColumnMapping failed.'},
      };
    }
  }

  /**
   * Create a new datapipeColumnMapping.
   *
   * @param {{
   *       datapipeColumnMappingName: string;
   *       clientName: string;
   *       clientEmail: string;
   *     }} body
   * @returns
   * @memberof DatapipeColumnMappingController
   */
  @Post('/datapipes/:datapipeId')
  @ApiParam({
    name: 'datapipeId',
    schema: {type: 'string'},
    description: 'The uuid of the datapipe.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  @ApiBody({
    description:
      "The 'datapipeColumnMappingName', 'clientName' and 'clientEmail' are required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          fromDatacatalogColumnId: 'd8141ece-f242-4288-a60a-8675538549cd',
          toDatacatalogColumnId: 're141ece-f242-4288-a60a-8675538549cd',
        },
      },
    },
  })
  async createDatapipeColumnMapping(
    @Param('datapipeId') datapipeId: string,
    @Body()
    body: {
      expression?: string;
      fromDatacatalogColumnId: string;
      toDatacatalogColumnId: string;
    }
  ) {
    // [step 1] Guard statement.

    // [step 2] Create datapipeColumnMapping.
    const result = await this.datapipeColumnMappingService.create({
      ...body,
      datapipe: {connect: {id: datapipeId}},
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'DatapipeColumnMapping create failed.'},
      };
    }
  }

  /**
   * Update datapipeColumnMapping
   *
   * @param {string} datapipeColumnMappingId
   * @param {{}} body
   * @returns
   * @memberof DatapipeColumnMappingController
   */
  @Post('/:datapipeColumnMappingId')
  @ApiParam({
    name: 'datapipeColumnMappingId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  @ApiBody({
    description: 'Update datapipe column mapping.',
    examples: {
      a: {
        summary: '1. Update mapping',
        value: {
          fromDatacatalogColumnId: 'd8141ece-f242-4288-a60a-8675538549cd',
          toDatacatalogColumnId: 're141ece-f242-4288-a60a-8675538549cd',
        },
      },
    },
  })
  async updateDatapipeColumnMapping(
    @Param('datapipeColumnMappingId') datapipeColumnMappingId: string,
    @Body()
    body: {
      expression?: string;
    }
  ) {
    // [step 1] Guard statement.

    // [step 2] Update environment.
    const result = await this.datapipeColumnMappingService.update({
      where: {id: datapipeColumnMappingId},
      data: {...body},
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Datapipe column mapping updated failed.'},
      };
    }
  }

  /* End */
}
