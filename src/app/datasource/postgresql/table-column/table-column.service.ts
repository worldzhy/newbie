import {Injectable} from '@nestjs/common';
import {
  DatasourcePostgresql,
  DatasourcePostgresqlTableColumn,
  Prisma,
} from '@prisma/client';
import {PrismaService} from '../../../../_prisma/_prisma.service';

@Injectable()
export class DatasourcePostgresqlTableColumnService {
  private prisma: PrismaService = new PrismaService();

  /**
   * Generate the table relations of the schema.
   * @param datasource
   * @returns
   */
  async extract(datasource: DatasourcePostgresql) {
    const columns: [] = await this.prisma
      .$queryRaw`SELECT * FROM information_schema.columns WHERE (table_schema = ${datasource.schema})`;

    // Prisma.DatasourcePostgresqlTableColumnCreateManyInput[] = [];
    return await this.createMany(
      columns.map((column: any) => {
        return {
          table: column.table_name,
          column: column.column_name,
          columnType: column.data_type,
          ordinalPosition: column.ordinal_position,
          datasourceId: datasource.id,
        };
      })
    );
  }

  /**
   * Get a datasourcePostgresql table column
   * @param {Prisma.DatasourcePostgresqlTableColumnWhereUniqueInput} where
   * @returns {(Promise<DatasourcePostgresqlTableColumn | null>)}
   * @memberof DatasourcePostgresqlTableColumnService
   */
  async findOne(
    where: Prisma.DatasourcePostgresqlTableColumnWhereUniqueInput
  ): Promise<DatasourcePostgresqlTableColumn | null> {
    return await this.prisma.datasourcePostgresqlTableColumn.findUnique({
      where,
    });
  }

  /**
   * Get many datasourcePostgresql table columns
   *
   * @param {{
   *     skip?: number;
   *     take?: number;
   *     where?: Prisma.DatasourcePostgresqlTableColumnWhereInput;
   *     orderBy?: Prisma.DatasourcePostgresqlTableColumnOrderByWithRelationAndSearchRelevanceInput;
   *     select?: Prisma.DatasourcePostgresqlTableColumnSelect;
   *   }} params
   * @returns
   * @memberof DatasourcePostgresqlTableColumnService
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.DatasourcePostgresqlTableColumnWhereInput;
    orderBy?: Prisma.DatasourcePostgresqlTableColumnOrderByWithRelationAndSearchRelevanceInput;
    select?: Prisma.DatasourcePostgresqlTableColumnSelect;
  }) {
    const {skip, take, where, orderBy, select} = params;

    return await this.prisma.datasourcePostgresqlTableColumn.findMany({
      skip,
      take,
      where,
      orderBy,
      select,
    });
  }

  /**
   * Get columns by group.
   * @param params
   * @returns
   */
  async groupBy(params: {
    by: Prisma.DatasourcePostgresqlTableColumnScalarFieldEnum[];
    where: Prisma.DatasourcePostgresqlTableColumnWhereInput;
    orderBy?: Prisma.DatasourcePostgresqlTableColumnOrderByWithAggregationInput;
  }) {
    return await this.prisma.datasourcePostgresqlTableColumn.groupBy(params);
  }

  /**
   * Create a datasourcePostgresql table column
   *
   * @param {Prisma.DatasourcePostgresqlTableColumnCreateInput} data
   * @returns {Promise<DatasourcePostgresqlTableColumn>}
   * @memberof DatasourcePostgresqlTableColumnService
   */
  async create(
    data: Prisma.DatasourcePostgresqlTableColumnCreateInput
  ): Promise<DatasourcePostgresqlTableColumn> {
    return await this.prisma.datasourcePostgresqlTableColumn.create({
      data,
    });
  }

  /**
   * Create many datasourcePostgresql table columns.
   * @param data
   * @returns
   */
  async createMany(
    data: Prisma.DatasourcePostgresqlTableColumnCreateManyInput[]
  ) {
    const result = await this.prisma.datasourcePostgresqlTableColumn.createMany(
      {data}
    );
    return result.count;
  }

  /**
   * Update a datasourcePostgresql table column
   *
   * @param {{
   *     where: Prisma.DatasourcePostgresqlTableColumnWhereUniqueInput;
   *     data: Prisma.DatasourcePostgresqlTableColumnUpdateInput;
   *   }} params
   * @returns {Promise<DatasourcePostgresqlTableColumn>}
   * @memberof DatasourcePostgresqlTableColumnService
   */
  async update(params: {
    where: Prisma.DatasourcePostgresqlTableColumnWhereUniqueInput;
    data: Prisma.DatasourcePostgresqlTableColumnUpdateInput;
  }): Promise<DatasourcePostgresqlTableColumn> {
    const {where, data} = params;
    return await this.prisma.datasourcePostgresqlTableColumn.update({
      data,
      where,
    });
  }

  /**
   * Delete a datasourcePostgresql table column
   *
   * @param {Prisma.DatasourcePostgresqlTableColumnWhereUniqueInput} where
   * @returns {Promise<DatasourcePostgresqlTableColumn>}
   * @memberof DatasourcePostgresqlTableColumnService
   */
  async delete(
    where: Prisma.DatasourcePostgresqlTableColumnWhereUniqueInput
  ): Promise<DatasourcePostgresqlTableColumn> {
    return await this.prisma.datasourcePostgresqlTableColumn.delete({
      where,
    });
  }

  /* End */
}
