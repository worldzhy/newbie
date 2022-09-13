import {Injectable} from '@nestjs/common';
import {
  Prisma,
  DatatransPipeline,
  PostgresqlDatasourceTable,
} from '@prisma/client';
import {PrismaService} from '../../../../_prisma/_prisma.service';

@Injectable()
export class DatatransPipelineService {
  private prisma: PrismaService = new PrismaService();

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

  /**
   * Get a pipeline
   * @param {{
   *  where: Prisma.DatatransPipelineWhereUniqueInput;
   *  include?: Prisma.DatatransPipelineInclude;
   * }} params
   * @returns {(Promise<DatatransPipeline | null>)}
   * @memberof DatatransPipelineService
   */
  async findOne(params: {
    where: Prisma.DatatransPipelineWhereUniqueInput;
    include?: Prisma.DatatransPipelineInclude;
  }): Promise<DatatransPipeline | null> {
    return await this.prisma.datatransPipeline.findUnique(params);
  }

  /**
   * Get many pipelines
   *
   * @param {{
   *     skip?: number;
   *     take?: number;
   *     where?: Prisma.DatatransPipelineWhereInput;
   *     orderBy?: Prisma.DatatransPipelineOrderByWithRelationAndSearchRelevanceInput;
   *     select?: Prisma.DatatransPipelineSelect;
   *   }} params
   * @returns
   * @memberof DatatransPipelineService
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.DatatransPipelineWhereInput;
    orderBy?: Prisma.DatatransPipelineOrderByWithRelationAndSearchRelevanceInput;
    select?: Prisma.DatatransPipelineSelect;
  }) {
    const {skip, take, where, orderBy, select} = params;
    return await this.prisma.datatransPipeline.findMany({
      skip,
      take,
      where,
      orderBy,
      select,
    });
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

  /**
   * Create a pipeline
   *
   * @param {Prisma.DatatransPipelineCreateInput} data
   * @returns {Promise<DatatransPipeline>}
   * @memberof DatatransPipelineService
   */
  async create(
    data: Prisma.DatatransPipelineCreateInput
  ): Promise<DatatransPipeline> {
    return await this.prisma.datatransPipeline.create({
      data,
    });
  }

  /**
   * Update a pipeline
   *
   * @param {{
   *     where: Prisma.DatatransPipelineWhereUniqueInput;
   *     data: Prisma.DatatransPipelineUpdateInput;
   *   }} params
   * @returns {Promise<DatatransPipeline>}
   * @memberof DatatransPipelineService
   */
  async update(params: {
    where: Prisma.DatatransPipelineWhereUniqueInput;
    data: Prisma.DatatransPipelineUpdateInput;
  }): Promise<DatatransPipeline> {
    const {where, data} = params;
    return await this.prisma.datatransPipeline.update({
      data,
      where,
    });
  }

  /**
   * Delete a pipeline
   *
   * @param {Prisma.DatatransPipelineWhereUniqueInput} where
   * @returns {Promise<DatatransPipeline>}
   * @memberof DatatransPipelineService
   */
  async delete(
    where: Prisma.DatatransPipelineWhereUniqueInput
  ): Promise<DatatransPipeline> {
    return await this.prisma.datatransPipeline.delete({
      where,
    });
  }

  /* End */
}
