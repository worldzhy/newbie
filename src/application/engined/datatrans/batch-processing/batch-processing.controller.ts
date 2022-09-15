import {Controller, Get, Param} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam} from '@nestjs/swagger';
import {DatatransBatchProcessingService} from './batch-processing.service';
import {DatatransPipelineService} from '../pipeline/pipeline.service';
import {DatatransPipelineState} from '@prisma/client';

@ApiTags('[Application] EngineD / Datatrans / Batch Processing')
@ApiBearerAuth()
@Controller('datatrans')
export class DatatransBatchProcessingController {
  private pipelineService = new DatatransPipelineService();
  private datatransBatchProcessingService =
    new DatatransBatchProcessingService();

  /**
   * Start pipeline batch-processing
   * @param {string} pipelineId
   * @returns
   * @memberof DatatransBatchProcessingController
   */
  @Get('/batch-processing/:pipelineId/start')
  @ApiParam({
    name: 'pipelineId',
    schema: {type: 'string'},
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  async startBatchProcessing(@Param('pipelineId') pipelineId: string) {
    // [step 1] Get pipeline.
    const pipeline = await this.pipelineService.findUnique({
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
    return await this.datatransBatchProcessingService.start(pipeline);
  }

  /**
   * Stop pipeline batch-processing
   * @param {string} pipelineId
   * @returns
   * @memberof DatatransBatchProcessingController
   */
  @Get('/batch-processing/:pipelineId/stop')
  @ApiParam({
    name: 'pipelineId',
    schema: {type: 'string'},
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  async stopBatchProcessing(@Param('pipelineId') pipelineId: string) {
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
   * Purge pipeline batch-processing
   * @param {string} pipelineId
   * @returns
   * @memberof DatatransBatchProcessingController
   */
  @Get('/batch-processing/:pipelineId/purge')
  @ApiParam({
    name: 'pipelineId',
    schema: {type: 'string'},
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  async purgeBatchProcessing(@Param('pipelineId') pipelineId: string) {
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
