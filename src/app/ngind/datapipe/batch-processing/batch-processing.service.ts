import {Injectable} from '@nestjs/common';
import {Datapipe, PostgresqlDatasourceTable} from '@prisma/client';
import {SqsService} from 'src/_aws/_sqs.service';
import {PrismaService} from '../../../../_prisma/_prisma.service';

@Injectable()
export class DatapipeBatchProcessingService {
  private prisma: PrismaService = new PrismaService();
  private sqs: SqsService = new SqsService();

  /**
   * Start batch processing.
   * @param datapipe
   * @returns
   */
  async start(datapipe: Datapipe) {
    // [step 1] Calculate the number of batches.
    const numberOfBatches = await this.calculateNumberOfBatches(datapipe);

    // [step 2] Send transportatioin tasks to SQS.
    for (let i = 0; i < numberOfBatches; i++) {
      const messageBody = {
        datapipeId: datapipe.id,
        take: datapipe.numberOfRecordsPerBatch,
        skip: datapipe.numberOfRecordsPerBatch * i,
      };

      // todo replace with task-mgmt.sendTask
      await this.sqs.sendMessage(datapipe.queueUrl!, messageBody);
    }

    return 'The datapipe has started batch processing.';
  }

  /**
   * Calculate the number of transportatioin batches
   * @param datapipe
   * @returns
   */
  private async calculateNumberOfBatches(datapipe: Datapipe) {
    const fromTable = datapipe['fromTable'] as PostgresqlDatasourceTable;
    const numberOfRecordsPerBatch = datapipe.numberOfRecordsPerBatch;
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
      datapipe.hasManyTables.map(async tableName => {
        countResult = await this.prisma.$queryRawUnsafe(
          `SELECT COUNT(*) FROM "${tableName}"`
        );

        recordAverageSize += Number(countResult[0].count) / total;
      })
    );

    // [step 3] Get the total count of the parent tables' records.
    await Promise.all(
      datapipe.belongsToTables.map(async tableName => {
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
