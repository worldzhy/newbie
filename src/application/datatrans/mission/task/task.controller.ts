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
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {
  Prisma,
  DatatransTask,
  DatatransTaskState,
  DatatransPipeline,
  PostgresqlDatasourceTable,
  ElasticsearchDatasourceIndex,
  PostgresqlDatasourceConstraintKeyType,
} from '@prisma/client';
import {AwsSqsService} from '@microservices/aws/aws-sqs.service';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {ConfigService} from '@nestjs/config';

@ApiTags('Datatrans Task')
@ApiBearerAuth()
@Controller('datatrans-tasks')
export class DatatransTaskController {
  constructor(
    private readonly sqs: AwsSqsService,
    private readonly prisma: PrismaService,
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
    return await this.prisma.datatransTask.create({data: body});
  }

  @Get('')
  async getDatatransTasks(): Promise<DatatransTask[]> {
    return await this.prisma.datatransTask.findMany({});
  }

  @Get(':taskId')
  async getDatatransTask(
    @Param('taskId') taskId: number
  ): Promise<DatatransTask | null> {
    return await this.prisma.datatransTask.findUnique({
      where: {id: taskId},
    });
  }

  @Patch(':taskId')
  async updateDatatransTask(
    @Param('taskId') taskId: number,
    @Body() body: Prisma.DatatransTaskUpdateInput
  ): Promise<DatatransTask> {
    return await this.prisma.datatransTask.update({
      where: {id: taskId},
      data: body,
    });
  }

  @Delete(':taskId')
  async deleteDatatransTask(
    @Param('taskId') taskId: number
  ): Promise<DatatransTask> {
    return await this.prisma.datatransTask.delete({
      where: {id: taskId},
    });
  }

  //* Process the task.
  @Patch(':taskId/process')
  async stopDatatransTask(
    @Param('taskId') taskId: number
  ): Promise<DatatransTask> {
    // [step 1] Get task.
    const task = await this.prisma.datatransTask.findUniqueOrThrow({
      where: {id: taskId},
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
        await this.prisma.postgresqlDatasourceConstraint.findFirstOrThrow({
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

    // [step 4] Update task state.
    return await this.prisma.datatransTask.update({
      where: {id: taskId},
      data: {state: DatatransTaskState.DONE},
    });
  }

  //* Send to queue, then AWS Lambda will process the task.
  @Patch(':taskId/task2sqs')
  async startDatatransTask(
    @Param('taskId') taskId: number
  ): Promise<DatatransTask> {
    // [step 1] Get task.
    const task = await this.prisma.datatransTask.findUniqueOrThrow({
      where: {id: taskId},
    });

    // [step 2] Send task to queue.
    const output = await this.sqs.sendMessage({
      queueUrl: this.configService.getOrThrow<string>(
        'microservices.aws.sqs.queueUrl'
      ),
      body: {missionId: task.missionId, take: task.take, skip: task.skip},
    });

    // [step 3] Update task state.
    return await this.prisma.datatransTask.update({
      where: {id: taskId},
      data: {
        state: DatatransTaskState.IN_QUEUE,
        sqsMessageId: output.MessageId,
        sqsResponse: output as object,
      },
    });
  }

  /* End */
}
