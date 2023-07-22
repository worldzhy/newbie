import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {DatatransPipelineService} from './pipeline.service';
import {PostgresqlDatasourceTableService} from '../../datasource/postgresql/table/table.service';
import {ElasticsearchDatasourceIndexService} from '../../datasource/elasticsearch/index/index.service';
import {DatatransPipeline, Prisma} from '@prisma/client';

@ApiTags('[Application] EngineD / Datatrans Pipeline')
@ApiBearerAuth()
@Controller('datatrans-pipelines')
export class DatatransPipelineController {
  constructor(
    private readonly pipelineService: DatatransPipelineService,
    private readonly postgresqlDatasourceTableService: PostgresqlDatasourceTableService,
    private readonly elasticsearchDatasourceIndexService: ElasticsearchDatasourceIndexService
  ) {}

  @Post('')
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
          fromTableId: 1,
          toIndexId: 1,
        },
      },
    },
  })
  async createPipeline(
    @Body()
    body: Prisma.DatatransPipelineUncheckedCreateInput
  ): Promise<DatatransPipeline> {
    // [step 1] Check if the fromTable and toIndex are existed.
    if (
      !(await this.postgresqlDatasourceTableService.checkExistence(
        body.fromTableId
      ))
    ) {
      throw new NotFoundException('Not found the postgresql table.');
    }
    if (
      !(await this.elasticsearchDatasourceIndexService.checkExistence(
        body.toIndexId
      ))
    ) {
      throw new NotFoundException('Not found the elasticsearch index.');
    }

    // [step 2] Create pipeline.
    return await this.pipelineService.create({
      name: body.name,
      hasManyTables: body.hasManyTables,
      belongsToTables: body.belongsToTables,
      fromTable: {connect: {id: body.fromTableId}},
      toIndex: {connect: {id: body.toIndexId}},
    });
  }

  @Get('')
  async getPipelines(): Promise<DatatransPipeline[]> {
    return await this.pipelineService.findMany({});
  }

  @Get(':pipelineId')
  @ApiParam({
    name: 'pipelineId',
    schema: {type: 'string'},
    description: 'The uuid of the pipeline.',
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  async getPipeline(
    @Param('pipelineId') pipelineId: string
  ): Promise<DatatransPipeline | null> {
    return await this.pipelineService.findUnique({
      where: {id: pipelineId},
    });
  }

  @Patch(':pipelineId')
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
        },
      },
    },
  })
  async updatePipeline(
    @Param('pipelineId') pipelineId: string,
    @Body()
    body: Prisma.DatatransPipelineUpdateInput
  ): Promise<DatatransPipeline> {
    return await this.pipelineService.update({
      where: {id: pipelineId},
      data: body,
    });
  }

  @Delete(':pipelineId')
  @ApiParam({
    name: 'pipelineId',
    schema: {type: 'string'},
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  async deletePipeline(
    @Param('pipelineId') pipelineId: string
  ): Promise<DatatransPipeline> {
    return await this.pipelineService.delete({where: {id: pipelineId}});
  }

  @Get(':pipelineId/overview')
  @ApiParam({
    name: 'pipelineId',
    schema: {type: 'string'},
    example: '81a37534-915c-4114-96d0-01be815d821b',
  })
  async overviewPipeline(@Param('pipelineId') pipelineId: string): Promise<{
    table: string;
    numberOfRecords: number;
    recordAverageSize: number;
    hasMany: {name: string; numberOfRecords: number}[];
    belongsTo: {name: string; numberOfRecords: number}[];
  }> {
    // [step 1] Get pipeline.
    const pipeline = await this.pipelineService.findUnique({
      where: {id: pipelineId},
      include: {fromTable: true},
    });
    if (!pipeline) {
      throw new NotFoundException('Not found the pipeline.');
    }

    // [step 2] Update name.
    return await this.pipelineService.overview(pipeline);
  }

  /* End */
}
