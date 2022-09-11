import {Injectable} from '@nestjs/common';
import {PostgresqlDatasourceTableColumn, Prisma} from '@prisma/client';
import {PrismaService} from '../../../../../_prisma/_prisma.service';

@Injectable()
export class PostgresqlDatasourceTableColumnService {
  private prisma: PrismaService = new PrismaService();

  /**
   * Get a postgresqlDatasource table column.
   * @param {Prisma.PostgresqlDatasourceTableColumnWhereUniqueInput} where
   * @returns {(Promise<PostgresqlDatasourceTableColumn | null>)}
   * @memberof PostgresqlDatasourceTableColumnService
   */
  async findOne(
    where: Prisma.PostgresqlDatasourceTableColumnWhereUniqueInput
  ): Promise<PostgresqlDatasourceTableColumn | null> {
    return await this.prisma.postgresqlDatasourceTableColumn.findUnique({
      where,
    });
  }

  /**
   * Get many postgresqlDatasource table columns.
   *
   * @param {{
   *     skip?: number;
   *     take?: number;
   *     where?: Prisma.PostgresqlDatasourceTableColumnWhereInput;
   *     orderBy?: Prisma.PostgresqlDatasourceTableColumnOrderByWithRelationAndSearchRelevanceInput;
   *     select?: Prisma.PostgresqlDatasourceTableColumnSelect;
   *   }} params
   * @returns
   * @memberof PostgresqlDatasourceTableColumnService
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.PostgresqlDatasourceTableColumnWhereInput;
    orderBy?: Prisma.PostgresqlDatasourceTableColumnOrderByWithRelationAndSearchRelevanceInput;
    select?: Prisma.PostgresqlDatasourceTableColumnSelect;
  }) {
    const {skip, take, where, orderBy, select} = params;

    return await this.prisma.postgresqlDatasourceTableColumn.findMany({
      skip,
      take,
      where,
      orderBy,
      select,
    });
  }

  /**
   * Create a postgresqlDatasource table column.
   *
   * @param {Prisma.PostgresqlDatasourceTableColumnCreateInput} data
   * @returns {Promise<PostgresqlDatasourceTableColumn>}
   * @memberof PostgresqlDatasourceTableColumnService
   */
  async create(
    data: Prisma.PostgresqlDatasourceTableColumnCreateInput
  ): Promise<PostgresqlDatasourceTableColumn> {
    return await this.prisma.postgresqlDatasourceTableColumn.create({
      data,
    });
  }

  /**
   * Create many postgresqlDatasource table columns.
   * @param data
   * @returns
   */
  async createMany(
    data: Prisma.PostgresqlDatasourceTableColumnCreateManyInput[]
  ) {
    const result = await this.prisma.postgresqlDatasourceTableColumn.createMany(
      {data}
    );
    return result.count;
  }

  /**
   * Update a postgresqlDatasource table column.
   *
   * @param {{
   *     where: Prisma.PostgresqlDatasourceTableColumnWhereUniqueInput;
   *     data: Prisma.PostgresqlDatasourceTableColumnUpdateInput;
   *   }} params
   * @returns {Promise<PostgresqlDatasourceTableColumn>}
   * @memberof PostgresqlDatasourceTableColumnService
   */
  async update(params: {
    where: Prisma.PostgresqlDatasourceTableColumnWhereUniqueInput;
    data: Prisma.PostgresqlDatasourceTableColumnUpdateInput;
  }): Promise<PostgresqlDatasourceTableColumn> {
    const {where, data} = params;
    return await this.prisma.postgresqlDatasourceTableColumn.update({
      data,
      where,
    });
  }

  /**
   * Delete a postgresqlDatasource table column.
   * @returns {Promise<PostgresqlDatasourceTableColumn>}
   * @memberof PostgresqlDatasourceTableColumnService
   */
  async delete(params: {
    where: Prisma.PostgresqlDatasourceTableColumnWhereUniqueInput;
    include?: Prisma.PostgresqlDatasourceTableColumnInclude;
  }): Promise<PostgresqlDatasourceTableColumn> {
    return await this.prisma.postgresqlDatasourceTableColumn.delete(params);
  }

  /**
   * Delete many postgresql datasource table columns.
   *
   * @param {Prisma.PostgresqlDatasourceTableColumnWhereInput} where
   * @returns {Promise<PostgresqlDatasourceTableColumn>}
   * @memberof PostgresqlDatasourceTableColumnService
   */
  async deleteMany(
    where: Prisma.PostgresqlDatasourceTableColumnWhereInput
  ): Promise<number> {
    const result = await this.prisma.postgresqlDatasourceTableColumn.deleteMany(
      {where}
    );

    return result.count;
  }

  /* End */
}
