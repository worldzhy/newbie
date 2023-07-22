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
import {
  Prisma,
  DatatransTask,
  DatatransTaskState,
  DatatransPipeline,
  PostgresqlDatasourceTable,
  ElasticsearchDatasourceIndex,
  PostgresqlDatasourceConstraintKeyType,
} from '@prisma/client';
import {DatatransTaskService} from './task.service';
import {SqsService} from '../../../../../toolkit/aws/aws.sqs.service';
import {PrismaService} from '../../../../../toolkit/prisma/prisma.service';
import {PostgresqlDatasourceConstraintService} from 'src/application/engined/datasource/postgresql/constraint/constraint.service';
import {ConfigService} from '@nestjs/config';

@ApiTags('[Application] EngineD / Datatrans Task')
@ApiBearerAuth()
@Controller('datatrans-tasks')
export class DatatransTaskController {
  constructor(
    private readonly datatransTaskService: DatatransTaskService,
    private readonly sqsService: SqsService,
    private readonly prisma: PrismaService,
    private readonly postgresqlDatasourceConstraintService: PostgresqlDatasourceConstraintService,
    private readonly configService: ConfigService
  ) {}

  @Post('')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          take: 10,
          skip: 0,
          missionId: '5842956f-7dce-4c60-928d-575450c96d19',
        },
      },
    },
  })
  async createDatatransTask(
    @Body() body: Prisma.DatatransTaskUncheckedCreateInput
  ): Promise<DatatransTask> {
    return await this.datatransTaskService.create({data: body});
  }

  @Get('')
  async getDatatransTasks(): Promise<DatatransTask[]> {
    return await this.datatransTaskService.findMany({});
  }

  @Get(':taskId')
  @ApiParam({
    name: 'taskId',
    schema: {type: 'number'},
    description: 'The id of the datatransTask.',
    example: 1,
  })
  async getDatatransTask(
    @Param('taskId') taskId: string
  ): Promise<DatatransTask | null> {
    return await this.datatransTaskService.findUnique({
      where: {id: parseInt(taskId)},
    });
  }

  @Patch(':taskId')
  @ApiParam({
    name: 'taskId',
    schema: {type: 'number'},
    description: 'The id of the datatrans task.',
    example: 1,
  })
  async updateDatatransTask(
    @Param('taskId') taskId: string,
    @Body() body: Prisma.DatatransTaskUpdateInput
  ): Promise<DatatransTask> {
    return await this.datatransTaskService.update({
      where: {id: parseInt(taskId)},
      data: body,
    });
  }

  @Delete(':taskId')
  @ApiParam({
    name: 'taskId',
    schema: {type: 'number'},
    description: 'The id of the datatrans task.',
    example: 1,
  })
  async deleteDatatransTask(
    @Param('taskId') taskId: string
  ): Promise<DatatransTask> {
    return await this.datatransTaskService.delete({
      where: {id: parseInt(taskId)},
    });
  }

  //* Process the task.
  @Patch(':taskId/process')
  @ApiParam({
    name: 'taskId',
    schema: {type: 'number'},
    example: 1,
  })
  async stopDatatransTask(
    @Param('taskId') taskId: string
  ): Promise<DatatransTask> {
    // [step 1] Get task.
    const task = await this.datatransTaskService.findUniqueOrThrow({
      where: {id: parseInt(taskId)},
      include: {
        mission: {
          include: {
            datatransPipeline: {include: {fromTable: true, toIndex: true}},
          },
        },
      },
    });

    // [step 2] Parse task.
    const pipeline = task['mission']['datatransPipeline'] as DatatransPipeline;
    const fromTable = pipeline['fromTable'] as PostgresqlDatasourceTable;
    const hasManyTables = pipeline.hasManyTables;
    const belongsToTables = pipeline.belongsToTables;
    const toIndex = pipeline['toIndex'] as ElasticsearchDatasourceIndex;

    // [step 3] Process task.
    if (!(fromTable.name in Prisma.ModelName)) {
      throw new NotFoundException('Not found the fromTable.');
    }
    hasManyTables.forEach(tableName => {
      if (!(tableName in Prisma.ModelName)) {
        throw new NotFoundException(
          'Not found one of pipeline->hasManyTables.'
        );
      }
    });
    belongsToTables.forEach(tableName => {
      if (!(tableName in Prisma.ModelName)) {
        throw new NotFoundException(
          'Not found one of pipeline->belongsToTables.'
        );
      }
    });

    // [step 3-1] Get fromTable records.
    const fromTableRecords: any[] = await this.prisma.$queryRawUnsafe(
      `SELECT * FROM "${fromTable.schema}"."${fromTable.name}" LIMIT ${task.take} OFFSET ${task.skip}`
    );

    // [step 3-2] Attach child tables' records to fromTable.
    for (let index = 0; index < hasManyTables.length; index++) {
      const childTableName = hasManyTables[index];
      const constraint =
        await this.postgresqlDatasourceConstraintService.findFirstOrThrow({
          where: {
            AND: [
              {table: childTableName},
              {keyType: PostgresqlDatasourceConstraintKeyType.FOREIGN_KEY},
              {foreignTable: fromTable.name},
            ],
          },
        });

      constraint.keyColumn;

      for (let index = 0; index < fromTableRecords.length; index++) {
        const fromTableRecord = fromTableRecords[index];
        const childTableRecords: any[] = await this.prisma.$queryRawUnsafe(
          `SELECT * FROM "${fromTable.schema}"."${fromTable.name}" LIMIT ${task.take} OFFSET ${task.skip}`
        );
      }
    }

    console.log('@@@@@@@@@@@@@@@@@@');
    console.log();
    console.log('##################');

    // [step 4] Update task state.
    return await this.datatransTaskService.update({
      where: {id: parseInt(taskId)},
      data: {state: DatatransTaskState.DONE},
    });
  }

  //* Send to queue, then AWS Lambda will process the task.
  @Patch(':taskId/task2sqs')
  @ApiParam({
    name: 'taskId',
    schema: {type: 'number'},
    example: 1,
  })
  async startDatatransTask(
    @Param('taskId') taskId: string
  ): Promise<DatatransTask> {
    // [step 1] Get task.
    const task = await this.datatransTaskService.findUniqueOrThrow({
      where: {id: parseInt(taskId)},
    });

    // [step 2] Send task to queue.
    const output = await this.sqsService.sendMessage({
      queueUrl: this.configService.get<string>(
        'microservices.task.sqsQueueUrl'
      )!,
      body: {missionId: task.missionId, take: task.take, skip: task.skip},
    });

    // [step 3] Update task state.
    return await this.datatransTaskService.update({
      where: {id: parseInt(taskId)},
      data: {
        state: DatatransTaskState.IN_QUEUE,
        sqsMessageId: output.MessageId,
        sqsResponse: output as object,
      },
    });
  }

  /* End */
}
