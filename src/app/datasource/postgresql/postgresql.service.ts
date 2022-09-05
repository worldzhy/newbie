import {Injectable} from '@nestjs/common';
import {DatasourcePostgresql, Prisma} from '@prisma/client';
import {PrismaService} from '../../../_prisma/_prisma.service';

@Injectable()
export class DatasourcePostgresqlService {
  private prisma: PrismaService = new PrismaService();

  /**
   * Get a datasourcePostgresql
   * @param {Prisma.DatasourcePostgresqlWhereUniqueInput} where
   * @returns {(Promise<DatasourcePostgresql | null>)}
   * @memberof DatasourcePostgresqlService
   */
  async findOne(
    where: Prisma.DatasourcePostgresqlWhereUniqueInput
  ): Promise<DatasourcePostgresql | null> {
    return await this.prisma.datasourcePostgresql.findUnique({where});
  }

  /**
   * Get many datasourcePostgresqls
   *
   * @param {{
   *     skip?: number;
   *     take?: number;
   *     where?: Prisma.DatasourcePostgresqlWhereInput;
   *     orderBy?: Prisma.DatasourcePostgresqlOrderByWithRelationAndSearchRelevanceInput;
   *     select?: Prisma.DatasourcePostgresqlSelect;
   *   }} params
   * @returns
   * @memberof DatasourcePostgresqlService
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.DatasourcePostgresqlWhereInput;
    orderBy?: Prisma.DatasourcePostgresqlOrderByWithRelationAndSearchRelevanceInput;
    select?: Prisma.DatasourcePostgresqlSelect;
  }) {
    const {skip, take, where, orderBy, select} = params;
    return await this.prisma.datasourcePostgresql.findMany({
      skip,
      take,
      where,
      orderBy,
      select,
    });
  }

  /**
   * Create a datasourcePostgresql
   *
   * @param {Prisma.DatasourcePostgresqlCreateInput} data
   * @returns {Promise<DatasourcePostgresql>}
   * @memberof DatasourcePostgresqlService
   */
  async create(
    data: Prisma.DatasourcePostgresqlCreateInput
  ): Promise<DatasourcePostgresql> {
    return await this.prisma.datasourcePostgresql.create({
      data,
    });
  }

  /**
   * Update a datasourcePostgresql
   *
   * @param {{
   *     where: Prisma.DatasourcePostgresqlWhereUniqueInput;
   *     data: Prisma.DatasourcePostgresqlUpdateInput;
   *   }} params
   * @returns {Promise<DatasourcePostgresql>}
   * @memberof DatasourcePostgresqlService
   */
  async update(params: {
    where: Prisma.DatasourcePostgresqlWhereUniqueInput;
    data: Prisma.DatasourcePostgresqlUpdateInput;
  }): Promise<DatasourcePostgresql> {
    const {where, data} = params;
    return await this.prisma.datasourcePostgresql.update({
      data,
      where,
    });
  }

  /**
   * Delete a datasourcePostgresql
   *
   * @param {Prisma.DatasourcePostgresqlWhereUniqueInput} where
   * @returns {Promise<DatasourcePostgresql>}
   * @memberof DatasourcePostgresqlService
   */
  async delete(
    where: Prisma.DatasourcePostgresqlWhereUniqueInput
  ): Promise<DatasourcePostgresql> {
    return await this.prisma.datasourcePostgresql.delete({
      where,
    });
  }

  async getTables(datasource: DatasourcePostgresql) {
    return await this.prisma
      .$queryRaw`SELECT * FROM information_schema.tables WHERE (table_schema = ${datasource.schema})`;
  }

  async getTriggers(datasource: DatasourcePostgresql): Promise<any[]> {
    const result: any[] = await this.prisma
      .$queryRaw`SELECT * FROM information_schema.triggers WHERE event_object_schema = ${datasource.schema}`;
    const triggers: any[] = [];

    result.forEach((item: any) => {
      triggers.push({
        tableName: item.event_object_table,
        tableSchema: item.event_object_schema,
        triggerName: item.trigger_name,
        triggerManipulation: item.event_manipulation,
      });
    });
    return triggers;
  }

  async selectFields(
    table: string,
    selectList: string[],
    rows: number = 5000,
    offset: number = 0,
    datasource: DatasourcePostgresql
  ): Promise<{}[]> {
    return await this.prisma
      .$queryRaw`SELECT ${selectList} FROM ${datasource.schema}.${table} ORDER BY ${selectList} DESC LIMIT ${rows} OFFSET ${offset}`;
  }

  /* End */
}
