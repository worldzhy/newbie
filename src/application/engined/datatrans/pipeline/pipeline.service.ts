import {Injectable} from '@nestjs/common';
import {
  Prisma,
  DatatransPipeline,
  PostgresqlDatasourceTable,
} from '@prisma/client';
import {PrismaService} from '../../../../toolkits/prisma/prisma.service';

@Injectable()
export class DatatransPipelineService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(
    params: Prisma.DatatransPipelineFindUniqueArgs
  ): Promise<DatatransPipeline | null> {
    return await this.prisma.datatransPipeline.findUnique(params);
  }

  async findMany(
    params: Prisma.DatatransPipelineFindManyArgs
  ): Promise<DatatransPipeline[]> {
    return await this.prisma.datatransPipeline.findMany(params);
  }

  async create(
    data: Prisma.DatatransPipelineCreateInput
  ): Promise<DatatransPipeline> {
    return await this.prisma.datatransPipeline.create({
      data,
    });
  }

  async update(
    params: Prisma.DatatransPipelineUpdateArgs
  ): Promise<DatatransPipeline> {
    return await this.prisma.datatransPipeline.update(params);
  }

  async delete(
    params: Prisma.DatatransPipelineDeleteArgs
  ): Promise<DatatransPipeline> {
    return await this.prisma.datatransPipeline.delete(params);
  }

  /**
   * Check if exist
   *
   * @param {string} id
   * @returns
   * @memberof DatatransPipelineService
   */
  async checkExistence(id: string) {
    const count = await this.prisma.datatransPipeline.count({
      where: {id},
    });
    return count > 0 ? true : false;
  }

  async overview(pipeline: DatatransPipeline) {
    const fromTable = pipeline['fromTable'] as PostgresqlDatasourceTable;
    const numberOfRecordsPerBatch = pipeline.numberOfRecordsPerBatch;

    const childTables: {name: string; numberOfRecords: number}[] = [];
    const parentTables: {name: string; numberOfRecords: number}[] = [];
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

        childTables.push({
          name: tableName,
          numberOfRecords: Number(countResult[0].count),
        });

        recordAverageSize += Number(countResult[0].count) / total;
      })
    );

    // [step 3] Get the total count of the parent tables' records.
    await Promise.all(
      pipeline.belongsToTables.map(async tableName => {
        countResult = await this.prisma.$queryRawUnsafe(
          `SELECT COUNT(*) FROM "${tableName}"`
        );

        parentTables.push({
          name: tableName,
          numberOfRecords: Number(countResult[0].count),
        });

        recordAverageSize += 1.0;
      })
    );

    return {
      table: fromTable.name,
      numberOfRecords: total,
      hasMany: childTables,
      belongsTo: parentTables,
      batchProcessing: {
        recordAverageSize: parseFloat(recordAverageSize.toFixed(2)),
        numberOfRecordsPerBatch: numberOfRecordsPerBatch,
        numberOfBatches: Math.ceil(
          (total * recordAverageSize) / numberOfRecordsPerBatch
        ),
      },
    };
  }
  /* End */
}
