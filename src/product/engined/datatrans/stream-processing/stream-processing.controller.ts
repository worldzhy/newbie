import {Controller, Get, Param} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam} from '@nestjs/swagger';
import {DatatransStreamProcessingService} from './stream-processing.service';
import {DatatransPipelineService} from '../pipeline/pipeline.service';
import {DatatransPipelineState} from '@prisma/client';

@ApiTags('[Product] EngineD / Datatrans / Stream Processing')
@ApiBearerAuth()
@Controller('datatrans')
export class DatatransStreamProcessingController {
  private pipelineService = new DatatransPipelineService();
  private datatransStreamProcessingService =
    new DatatransStreamProcessingService();

  /**
   * Start pipeline stream-processing
   * @param {string} pipelineId
   * @returns
   * @memberof DatatransStreamProcessingController
   */
  @Get('/stream-processing/:pipelineId/start')
  @ApiParam({
    name: 'pipelineId',
    schema: {type: 'string'},
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  async startStreamProcessing(@Param('pipelineId') pipelineId: string) {
    // [step 1] Get pipeline.
    const pipeline = await this.pipelineService.findOne({
      where: {id: pipelineId},
      include: {fromTable: true},
    });
    if (!pipeline) {
      return {
        data: null,
        err: {message: 'Get pipeline failed.'},
      };
    }

    // [step 2] Start pipeline.
    const result = await this.datatransStreamProcessingService.start(pipeline);
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Datatrans stream-processing started failed.'},
      };
    }
  }

  /**
   * Stop pipeline stream-processing
   * @param {string} pipelineId
   * @returns
   * @memberof DatatransStreamProcessingController
   */
  @Get('/stream-processing/:pipelineId/stop')
  @ApiParam({
    name: 'pipelineId',
    schema: {type: 'string'},
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  async stopStreamProcessing(@Param('pipelineId') pipelineId: string) {
    // [step 1] Guard statement.

    // [step 2] Update name.
    const result = await this.pipelineService.update({
      where: {id: pipelineId},
      data: {state: DatatransPipelineState.IDLE},
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Datatrans stopped failed.'},
      };
    }
  }

  /**
   * Purge pipeline stream-processing
   * @param {string} pipelineId
   * @returns
   * @memberof DatatransStreamProcessingController
   */
  @Get('/stream-processing/:pipelineId/purge')
  @ApiParam({
    name: 'pipelineId',
    schema: {type: 'string'},
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  async purgeStreamProcessing(@Param('pipelineId') pipelineId: string) {
    // [step 1] Guard statement.

    // [step 2] Update name.
    const result = await this.pipelineService.update({
      where: {id: pipelineId},
      data: {state: DatatransPipelineState.IDLE},
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Datatrans purge failed.'},
      };
    }
  }

  /* End */
}
