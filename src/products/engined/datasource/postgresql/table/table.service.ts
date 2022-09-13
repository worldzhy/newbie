import {Injectable} from '@nestjs/common';
import {PostgresqlDatasourceTable, Prisma} from '@prisma/client';
import {PrismaService} from '../../../../../_prisma/_prisma.service';

@Injectable()
export class PostgresqlDatasourceTableService {
  private prisma: PrismaService = new PrismaService();

  /**
   * Get a postgresql datasource table.
   * @param {Prisma.PostgresqlDatasourceTableWhereUniqueInput} where
   * @returns {(Promise<PostgresqlDatasourceTable | null>)}
   * @memberof PostgresqlDatasourceTableService
   */
  async findOne(
    where: Prisma.PostgresqlDatasourceTableWhereUniqueInput
  ): Promise<PostgresqlDatasourceTable | null> {
    return await this.prisma.postgresqlDatasourceTable.findUnique({
      where,
    });
  }

  /**
   * Check if exist
   *
   * @param {number} id
   * @returns
   * @memberof PostgresqlDatasourceTableService
   */
  async checkExistence(id: number): Promise<boolean> {
    const count = await this.prisma.postgresqlDatasourceTable.count({
      where: {id: id},
    });

    return count > 0 ? true : false;
  }

  /**
   * Get many postgresql datasource tables.
   *
   * @param {{
   *     skip?: number;
   *     take?: number;
   *     where?: Prisma.PostgresqlDatasourceTableWhereInput;
   *     orderBy?: Prisma.PostgresqlDatasourceTableOrderByWithRelationAndSearchRelevanceInput;
   *     select?: Prisma.PostgresqlDatasourceTableSelect;
   *   }} params
   * @returns
   * @memberof PostgresqlDatasourceTableService
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.PostgresqlDatasourceTableWhereInput;
    orderBy?: Prisma.PostgresqlDatasourceTableOrderByWithRelationAndSearchRelevanceInput;
    select?: Prisma.PostgresqlDatasourceTableSelect;
  }) {
    const {skip, take, where, orderBy, select} = params;

    return await this.prisma.postgresqlDatasourceTable.findMany({
      skip,
      take,
      where,
      orderBy,
      select,
    });
  }

  /**
   * Create a postgresql datasource table.
   *
   * @param {Prisma.PostgresqlDatasourceTableCreateInput} data
   * @returns {Promise<PostgresqlDatasourceTable>}
   * @memberof PostgresqlDatasourceTableService
   */
  async create(
    data: Prisma.PostgresqlDatasourceTableCreateInput
  ): Promise<PostgresqlDatasourceTable> {
    return await this.prisma.postgresqlDatasourceTable.create({
      data,
    });
  }

  /**
   * Create many postgresql datasource tables.
   * @param data
   * @returns
   */
  async createMany(
    data: Prisma.PostgresqlDatasourceTableCreateManyInput[]
  ): Promise<number> {
    const result = await this.prisma.postgresqlDatasourceTable.createMany({
      data,
    });

    return result.count;
  }

  /**
   * Update a postgresql datasource table.
   *
   * @param {{
   *     where: Prisma.PostgresqlDatasourceTableWhereUniqueInput;
   *     data: Prisma.PostgresqlDatasourceTableUpdateInput;
   *   }} params
   * @returns {Promise<PostgresqlDatasourceTable>}
   * @memberof PostgresqlDatasourceTableService
   */
  async update(params: {
    where: Prisma.PostgresqlDatasourceTableWhereUniqueInput;
    data: Prisma.PostgresqlDatasourceTableUpdateInput;
  }): Promise<PostgresqlDatasourceTable> {
    const {where, data} = params;
    return await this.prisma.postgresqlDatasourceTable.update({
      data,
      where,
    });
  }

  /**
   * Delete a postgresql datasource table.
   * @returns {Promise<PostgresqlDatasourceTable>}
   * @memberof PostgresqlDatasourceTableService
   */
  async delete(params: {
    where: Prisma.PostgresqlDatasourceTableWhereUniqueInput;
    include?: Prisma.PostgresqlDatasourceTableInclude;
  }): Promise<PostgresqlDatasourceTable> {
    return await this.prisma.postgresqlDatasourceTable.delete(params);
  }

  /**
   * Delete many postgresql datasource tables.
   *
   * @param {Prisma.PostgresqlDatasourceTableWhereInput} where
   * @returns {Promise<PostgresqlDatasourceTable>}
   * @memberof PostgresqlDatasourceTableService
   */
  async deleteMany(
    where: Prisma.PostgresqlDatasourceTableWhereInput
  ): Promise<number> {
    const result = await this.prisma.postgresqlDatasourceTable.deleteMany({
      where,
    });

    return result.count;
  }

  /**
   * Count
   * @param where
   * @returns
   */
  async count(where: Prisma.PostgresqlDatasourceTableWhereInput) {
    return await this.prisma.postgresqlDatasourceTable.count({
      where,
    });
  }
  /* End */
}
