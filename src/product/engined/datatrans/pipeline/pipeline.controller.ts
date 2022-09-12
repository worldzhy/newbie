import {Controller, Get, Post, Param, Body, Delete} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {DatatransPipelineService} from './pipeline.service';
import {PostgresqlDatasourceTableService} from '../../datasource/postgresql/table/table.service';
import {ElasticsearchDatasourceIndexService} from '../../datasource/elasticsearch/index/index.service';

@ApiTags('[Product] EngineD / Datatrans / Pipeline')
@ApiBearerAuth()
@Controller('datatrans')
export class DatatransPipelineController {
  private pipelineService = new DatatransPipelineService();
  private postgresqlDatasourceTableService =
    new PostgresqlDatasourceTableService();
  private elasticsearchDatasourceIndexService =
    new ElasticsearchDatasourceIndexService();

  /**
   * Get pipelines by page number. The order is by pipeline name.
   *
   * @returns {Promise<{ data: object, err: object }>}
   * @memberof DatatransPipelineController
   */
  @Get('/pipelines')
  async getPipelines(): Promise<{data: object | null; err: object | null}> {
    const pipelines = await this.pipelineService.findMany({});
    return {
      data: pipelines,
      err: null,
    };
  }

  /**
   * Get pipeline by id
   *
   * @param {string} pipelineId
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof DatatransPipelineController
   */
  @Get('/pipelines/:pipelineId')
  @ApiParam({
    name: 'pipelineId',
    schema: {type: 'string'},
    description: 'The uuid of the pipeline.',
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  async getPipeline(
    @Param('pipelineId') pipelineId: string
  ): Promise<{data: object | null; err: object | null}> {
    const result = await this.pipelineService.findOne({
      where: {id: pipelineId},
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Get pipeline failed.'},
      };
    }
  }

  /**
   * Create a new pipeline.
   *
   * @param {{
   *   name: string;
   *   status: DatatransPipelineStatus;
   *   hasManyTables: string[];
   *   belongsToTables: string[];
   *   numberOfRecordsPerBatch: number;
   *   queueUrl?: string;
   *   fromTableId: number;
   *   toIndexId: number;
   * }} body
   * @returns
   * @memberof DatatransPipelineController
   */
  @Post('/pipelines')
  @ApiBody({
    description:
      "The 'name', 'status' and 'clientEmail' are required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'pipeline_01',
          hasManyTables: [],
          belongsToTables: [],
          numberOfRecordsPerBatch: 100,
          queueUrl:
            'https://sqs.cn-northwest-1.amazonaws.com.cn/077767357755/dev-inceptionpad-message-service-email-level1',
          fromTableId: 1,
          toIndexId: 1,
        },
      },
    },
  })
  async createPipeline(
    @Body()
    body: {
      name: string;
      hasManyTables: string[];
      belongsToTables: string[];
      numberOfRecordsPerBatch?: number;
      queueUrl?: string;
      fromTableId: number;
      toIndexId: number;
    }
  ) {
    // [step 1] Check if the fromTable and toIndex are existed.
    if (
      !(await this.postgresqlDatasourceTableService.checkExistence(
        body.fromTableId
      ))
    ) {
      return {
        data: null,
        err: {
          message: 'Please provide valid fromTableId in the request body.',
        },
      };
    }
    if (
      !(await this.elasticsearchDatasourceIndexService.checkExistence(
        body.toIndexId
      ))
    ) {
      return {
        data: null,
        err: {
          message: 'Please provide valid toIndexId in the request body.',
        },
      };
    }

    // [step 2] Create pipeline.
    const result = await this.pipelineService.create({
      name: body.name,
      hasManyTables: body.hasManyTables,
      belongsToTables: body.belongsToTables,
      numberOfRecordsPerBatch: body.numberOfRecordsPerBatch,
      queueUrl: body.queueUrl,
      fromTable: {connect: {id: body.fromTableId}},
      toIndex: {connect: {id: body.toIndexId}},
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'DatatransPipeline create failed.'},
      };
    }
  }

  /**
   * Update pipeline
   *
   * @param {string} pipelineId
   * @param {{name: string; hasManyTables: string[]; belongsToTables: string[];}} body
   * @returns
   * @memberof DatatransPipelineController
   */
  @Post('/pipelines/:pipelineId')
  @ApiParam({
    name: 'pipelineId',
    schema: {type: 'string'},
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  @ApiBody({
    description: 'Update pipeline.',
    examples: {
      a: {
        summary: '1. Update name',
        value: {
          name: 'pipeline-01',
          hasManyTables: [],
          belongsToTables: [],
          numberOfRecordsPerBatch: 100,
        },
      },
    },
  })
  async updatePipeline(
    @Param('pipelineId') pipelineId: string,
    @Body()
    body: {
      name: string;
      hasManyTables: string[];
      belongsToTables: string[];
      numberOfRecordsPerBatch: number;
    }
  ) {
    // [step 1] Guard statement.
    const {name, hasManyTables, belongsToTables, numberOfRecordsPerBatch} =
      body;

    // [step 2] Update name.
    const result = await this.pipelineService.update({
      where: {id: pipelineId},
      data: {name, hasManyTables, belongsToTables},
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'DatatransPipeline updated failed.'},
      };
    }
  }

  /**
   * Delete pipeline
   * @param {string} pipelineId
   * @returns
   * @memberof DatatransPipelineController
   */
  @Delete('/pipelines/:pipelineId')
  @ApiParam({
    name: 'pipelineId',
    schema: {type: 'string'},
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  async deletePipeline(@Param('pipelineId') pipelineId: string) {
    // [step 1] Guard statement.

    // [step 2] Delete pipeline.
    const result = await this.pipelineService.delete({id: pipelineId});
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'DatatransPipeline deleted failed.'},
      };
    }
  }

  /**
   * Overview pipeline
   * @param {string} pipelineId
   * @returns
   * @memberof DatatransPipelinePumpController
   */
  @Get('/pipelines/:pipelineId/overview')
  @ApiParam({
    name: 'pipelineId',
    schema: {type: 'string'},
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  async overviewPipeline(@Param('pipelineId') pipelineId: string) {
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

    // [step 2] Update name.
    const result = await this.pipelineService.overview(pipeline);
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'DatatransPipeline pump preview failed.'},
      };
    }
  }

  /* End */
}
