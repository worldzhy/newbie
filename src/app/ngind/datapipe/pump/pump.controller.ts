import {Controller, Get, Param} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam} from '@nestjs/swagger';
import {DatapipePumpService} from './pump.service';
import {DatapipeService} from '../datapipe.service';
import {DatapipeStatus} from '@prisma/client';

@ApiTags('App / Datapipe / Pump')
@ApiBearerAuth()
@Controller('datapipes')
export class DatapipePumpController {
  private datapipeService = new DatapipeService();
  private datapipePumpService = new DatapipePumpService();

  /**
   * pump prepare
   * @param {string} datapipeId
   * @returns
   * @memberof DatapipePumpController
   */
  @Get('/:datapipeId/pump/prepare')
  @ApiParam({
    name: 'datapipeId',
    schema: {type: 'string'},
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  async prepareDatapipePump(@Param('datapipeId') datapipeId: string) {
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

    // [step 2] Update name.
    const result = await this.datapipePumpService.prepare(datapipe);
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Datapipe pump started failed.'},
      };
    }
  }

  /**
   * Start datapipe pump
   * @param {string} datapipeId
   * @returns
   * @memberof DatapipePumpController
   */
  @Get('/:datapipeId/pump/start')
  @ApiParam({
    name: 'datapipeId',
    schema: {type: 'string'},
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  async startDatapipePump(@Param('datapipeId') datapipeId: string) {
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

    // [step 2] Update name.
    const result = await this.datapipePumpService.start(datapipe);
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Datapipe pump started failed.'},
      };
    }
  }

  /**
   * Stop datapipe pump
   * @param {string} datapipeId
   * @returns
   * @memberof DatapipePumpController
   */
  @Get('/:datapipeId/pump/stop')
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
      data: {status: DatapipeStatus.INACTIVE},
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
   * Purge datapipe pump
   * @param {string} datapipeId
   * @returns
   * @memberof DatapipePumpController
   */
  @Get('/:datapipeId/pump/purge')
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
      data: {status: DatapipeStatus.INACTIVE},
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
