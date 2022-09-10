import {Controller, Get, Param} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam} from '@nestjs/swagger';
import {DatapipeBatchProcessingService} from './batch-processing.service';
import {DatapipeService} from '../datapipe.service';
import {DatapipeState} from '@prisma/client';

@ApiTags('App / Datapipe / Batch Processing')
@ApiBearerAuth()
@Controller('datapipes')
export class DatapipeBatchProcessingController {
  private datapipeService = new DatapipeService();
  private datapipeBatchProcessingService = new DatapipeBatchProcessingService();

  /**
   * Start datapipe batch-processing
   * @param {string} datapipeId
   * @returns
   * @memberof DatapipeBatchProcessingController
   */
  @Get('/:datapipeId/batch-processing/start')
  @ApiParam({
    name: 'datapipeId',
    schema: {type: 'string'},
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  async startDatapipeBatchProcessing(@Param('datapipeId') datapipeId: string) {
    // [step 1] Get datapipe.
    const datapipe = await this.datapipeService.findOne({
      where: {id: datapipeId},
      include: {fromTable: true},
    });
    if (!datapipe) {
      return {
        data: null,
        err: {message: 'Get datapipe failed.'},
      };
    }

    // [step 2] Start datapipe.
    return await this.datapipeBatchProcessingService.start(datapipe);
  }

  /**
   * Stop datapipe batch-processing
   * @param {string} datapipeId
   * @returns
   * @memberof DatapipeBatchProcessingController
   */
  @Get('/:datapipeId/batch-processing/stop')
  @ApiParam({
    name: 'datapipeId',
    schema: {type: 'string'},
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  async stopDatapipe(@Param('datapipeId') datapipeId: string) {
    // [step 1] Guard statement.

    // [step 2] Update name.
    const result = await this.datapipeService.update({
      where: {id: datapipeId},
      data: {state: DatapipeState.IDLE},
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Datapipe stopped failed.'},
      };
    }
  }

  /**
   * Purge datapipe batch-processing
   * @param {string} datapipeId
   * @returns
   * @memberof DatapipeBatchProcessingController
   */
  @Get('/:datapipeId/batch-processing/purge')
  @ApiParam({
    name: 'datapipeId',
    schema: {type: 'string'},
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  async purgeDatapipe(@Param('datapipeId') datapipeId: string) {
    // [step 1] Guard statement.

    // [step 2] Update name.
    const result = await this.datapipeService.update({
      where: {id: datapipeId},
      data: {state: DatapipeState.IDLE},
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Datapipe purge failed.'},
      };
    }
  }

  /* End */
}
