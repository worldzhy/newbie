import {Injectable} from '@nestjs/common';
import {
  DatatransPipeline,
  PostgresqlDatasourceTable,
  TaskType,
} from '@prisma/client';
import {TaskService} from '../../../../microservices/task/task.service';
import {PrismaService} from '../../../../_prisma/_prisma.service';

@Injectable()
export class DatatransBatchProcessingService {
  private prisma: PrismaService = new PrismaService();
  private taskService = new TaskService();

  /**
   * Start batch processing.
   * @param pipeline
   * @returns
   */
  async start(pipeline: DatatransPipeline) {
    // [step 1] Calculate the number of batches.
    const numberOfBatches = await this.calculateNumberOfBatches(pipeline);

    // [step 2] Send transportation tasks to queue.
    for (let i = 0; i < numberOfBatches; i++) {
      const payload = {
        pipelineId: pipeline.id,
        take: pipeline.numberOfRecordsPerBatch,
        skip: pipeline.numberOfRecordsPerBatch * i,
      };

      await this.taskService.sendOne({
        type: TaskType.DATATRANS_BATCH_PROCESSING,
        payload: payload,
      });
    }

    return 'Datatrans has started batch processing.';
  }

  /**
   * Calculate the number of transportatioin batches
   * @param pipeline
   * @returns
   */
  private async calculateNumberOfBatches(pipeline: DatatransPipeline) {
    const fromTable = pipeline['fromTable'] as PostgresqlDatasourceTable;
    const numberOfRecordsPerBatch = pipeline.numberOfRecordsPerBatch;
    let countResult: {count: bigint}[];
    let recordAverageSize = 1.0;

    // [step 1] Get the total count of the table records.
    countResult = await this.prisma.$queryRawUnsafe(
      `SELECT COUNT(*) FROM "${fromTable.name}"`
    );

    // The type of countResult[0].count is bigint and it need to be converted to number.
    const total = Number(countResult[0].count);

    // [step 2] Get the total count of the child tables' records.
    await Promise.all(
      // Use 'map' instead of 'forEach'
      // https://www.becomebetterprogrammer.com/javascript-foreach-async-await/
      pipeline.hasManyTables.map(async tableName => {
        countResult = await this.prisma.$queryRawUnsafe(
          `SELECT COUNT(*) FROM "${tableName}"`
        );

        recordAverageSize += Number(countResult[0].count) / total;
      })
    );

    // [step 3] Get the total count of the parent tables' records.
    await Promise.all(
      pipeline.belongsToTables.map(async tableName => {
        countResult = await this.prisma.$queryRawUnsafe(
          `SELECT COUNT(*) FROM "${tableName}"`
        );

        recordAverageSize += 1.0;
      })
    );

    return Math.ceil((total * recordAverageSize) / numberOfRecordsPerBatch);
  }

  /* End */
}
