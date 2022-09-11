import {Controller, Get, Param} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam} from '@nestjs/swagger';
import {DatapipeStreamProcessingService} from './stream-processing.service';
import {DatapipeService} from '../datapipe.service';
import {DatapipeState} from '@prisma/client';

@ApiTags('[Product] EngineD / Datapipe / Stream Processing')
@ApiBearerAuth()
@Controller('datapipes')
export class DatapipeStreamProcessingController {
  private datapipeService = new DatapipeService();
  private datapipeStreamProcessingService =
    new DatapipeStreamProcessingService();

  /**
   * Start datapipe stream-processing
   * @param {string} datapipeId
   * @returns
   * @memberof DatapipeStreamProcessingController
   */
  @Get('/:datapipeId/stream-processing/start')
  @ApiParam({
    name: 'datapipeId',
    schema: {type: 'string'},
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  async startDatapipeStreamProcessing(@Param('datapipeId') datapipeId: string) {
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
    const result = await this.datapipeStreamProcessingService.start(datapipe);
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Datapipe stream-processing started failed.'},
      };
    }
  }

  /**
   * Stop datapipe stream-processing
   * @param {string} datapipeId
   * @returns
   * @memberof DatapipeStreamProcessingController
   */
  @Get('/:datapipeId/stream-processing/stop')
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
   * Purge datapipe stream-processing
   * @param {string} datapipeId
   * @returns
   * @memberof DatapipeStreamProcessingController
   */
  @Get('/:datapipeId/stream-processing/purge')
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
