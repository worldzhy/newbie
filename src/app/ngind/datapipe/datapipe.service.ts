import {Injectable} from '@nestjs/common';
import {Prisma, Datapipe, PostgresqlDatasourceTable} from '@prisma/client';
import {PrismaService} from '../../../_prisma/_prisma.service';

@Injectable()
export class DatapipeService {
  private prisma: PrismaService = new PrismaService();

  async overview(datapipe: Datapipe) {
    const fromTable = datapipe['fromTable'] as PostgresqlDatasourceTable;
    const batchQuantity = datapipe.batchQuantity;

    const childTables: {name: string; numberOfRecords: number}[] = [];
    const parentTables: {name: string; numberOfRecords: number}[] = [];
    let countResult: {count: bigint}[];
    let packageAverageSize = 1.0;

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

        childTables.push({
          name: tableName,
          numberOfRecords: Number(countResult[0].count),
        });

        packageAverageSize += Number(countResult[0].count) / total;
      })
    );

    // [step 3] Get the total count of the parent tables' records.
    await Promise.all(
      datapipe.belongsToTables.map(async tableName => {
        countResult = await this.prisma.$queryRawUnsafe(
          `SELECT COUNT(*) FROM "${tableName}"`
        );

        parentTables.push({
          name: tableName,
          numberOfRecords: Number(countResult[0].count),
        });

        packageAverageSize += 1.0;
      })
    );

    return {
      table: {
        name: fromTable.name,
        numberOfRecords: total,
        hasMany: childTables,
        belongsTo: parentTables,
      },
      packageAverageSize: parseFloat(packageAverageSize.toFixed(2)),
      batchQuantity: batchQuantity,
      batches: Math.ceil((total * packageAverageSize) / batchQuantity),
    };
  }

  /**
   * Get a datapipe
   * @param {{
   *  where: Prisma.DatapipeWhereUniqueInput;
   *  include?: Prisma.DatapipeInclude;
   * }} params
   * @returns {(Promise<Datapipe | null>)}
   * @memberof DatapipeService
   */
  async findOne(params: {
    where: Prisma.DatapipeWhereUniqueInput;
    include?: Prisma.DatapipeInclude;
  }): Promise<Datapipe | null> {
    return await this.prisma.datapipe.findUnique(params);
  }

  /**
   * Get many datapipes
   *
   * @param {{
   *     skip?: number;
   *     take?: number;
   *     where?: Prisma.DatapipeWhereInput;
   *     orderBy?: Prisma.DatapipeOrderByWithRelationAndSearchRelevanceInput;
   *     select?: Prisma.DatapipeSelect;
   *   }} params
   * @returns
   * @memberof DatapipeService
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.DatapipeWhereInput;
    orderBy?: Prisma.DatapipeOrderByWithRelationAndSearchRelevanceInput;
    select?: Prisma.DatapipeSelect;
  }) {
    const {skip, take, where, orderBy, select} = params;
    return await this.prisma.datapipe.findMany({
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
   * @memberof DatapipeService
   */
  async checkExistence(id: string) {
    const count = await this.prisma.datapipe.count({
      where: {id},
    });
    return count > 0 ? true : false;
  }

  /**
   * Create a datapipe
   *
   * @param {Prisma.DatapipeCreateInput} data
   * @returns {Promise<Datapipe>}
   * @memberof DatapipeService
   */
  async create(data: Prisma.DatapipeCreateInput): Promise<Datapipe> {
    return await this.prisma.datapipe.create({
      data,
    });
  }

  /**
   * Update a datapipe
   *
   * @param {{
   *     where: Prisma.DatapipeWhereUniqueInput;
   *     data: Prisma.DatapipeUpdateInput;
   *   }} params
   * @returns {Promise<Datapipe>}
   * @memberof DatapipeService
   */
  async update(params: {
    where: Prisma.DatapipeWhereUniqueInput;
    data: Prisma.DatapipeUpdateInput;
  }): Promise<Datapipe> {
    const {where, data} = params;
    return await this.prisma.datapipe.update({
      data,
      where,
    });
  }

  /**
   * Delete a datapipe
   *
   * @param {Prisma.DatapipeWhereUniqueInput} where
   * @returns {Promise<Datapipe>}
   * @memberof DatapipeService
   */
  async delete(where: Prisma.DatapipeWhereUniqueInput): Promise<Datapipe> {
    return await this.prisma.datapipe.delete({
      where,
    });
  }

  /* End */
}
