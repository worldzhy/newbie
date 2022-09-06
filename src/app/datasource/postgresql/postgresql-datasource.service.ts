import {Injectable} from '@nestjs/common';
import {PostgresqlDatasource, Prisma} from '@prisma/client';
import {PrismaService} from '../../../_prisma/_prisma.service';

@Injectable()
export class PostgresqlDatasourceService {
  private prisma: PrismaService = new PrismaService();

  /**
   * Get a postgresqlDatasource
   * @param {Prisma.PostgresqlDatasourceWhereUniqueInput} where
   * @returns {(Promise<PostgresqlDatasource | null>)}
   * @memberof PostgresqlDatasourceService
   */
  async findOne(
    where: Prisma.PostgresqlDatasourceWhereUniqueInput
  ): Promise<PostgresqlDatasource | null> {
    return await this.prisma.postgresqlDatasource.findUnique({where});
  }

  /**
   * Get many postgresqlDatasources
   *
   * @param {{
   *     skip?: number;
   *     take?: number;
   *     where?: Prisma.PostgresqlDatasourceWhereInput;
   *     orderBy?: Prisma.PostgresqlDatasourceOrderByWithRelationAndSearchRelevanceInput;
   *     select?: Prisma.PostgresqlDatasourceSelect;
   *   }} params
   * @returns
   * @memberof PostgresqlDatasourceService
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.PostgresqlDatasourceWhereInput;
    orderBy?: Prisma.PostgresqlDatasourceOrderByWithRelationAndSearchRelevanceInput;
    select?: Prisma.PostgresqlDatasourceSelect;
  }) {
    const {skip, take, where, orderBy, select} = params;
    return await this.prisma.postgresqlDatasource.findMany({
      skip,
      take,
      where,
      orderBy,
      select,
    });
  }

  /**
   * Create a postgresqlDatasource
   *
   * @param {Prisma.PostgresqlDatasourceCreateInput} data
   * @returns {Promise<PostgresqlDatasource>}
   * @memberof PostgresqlDatasourceService
   */
  async create(
    data: Prisma.PostgresqlDatasourceCreateInput
  ): Promise<PostgresqlDatasource> {
    return await this.prisma.postgresqlDatasource.create({
      data,
    });
  }

  /**
   * Update a postgresqlDatasource
   *
   * @param {{
   *     where: Prisma.PostgresqlDatasourceWhereUniqueInput;
   *     data: Prisma.PostgresqlDatasourceUpdateInput;
   *   }} params
   * @returns {Promise<PostgresqlDatasource>}
   * @memberof PostgresqlDatasourceService
   */
  async update(params: {
    where: Prisma.PostgresqlDatasourceWhereUniqueInput;
    data: Prisma.PostgresqlDatasourceUpdateInput;
  }): Promise<PostgresqlDatasource> {
    const {where, data} = params;
    return await this.prisma.postgresqlDatasource.update({
      data,
      where,
    });
  }

  /**
   * Delete a postgresqlDatasource
   *
   * @param {Prisma.PostgresqlDatasourceWhereUniqueInput} where
   * @returns {Promise<PostgresqlDatasource>}
   * @memberof PostgresqlDatasourceService
   */
  async delete(
    where: Prisma.PostgresqlDatasourceWhereUniqueInput
  ): Promise<PostgresqlDatasource> {
    return await this.prisma.postgresqlDatasource.delete({
      where,
    });
  }

  async getTables(datasource: PostgresqlDatasource) {
    return await this.prisma
      .$queryRaw`SELECT * FROM information_schema.tables WHERE (table_schema = ${datasource.schema})`;
  }

  async getTriggers(datasource: PostgresqlDatasource): Promise<any[]> {
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
    datasource: PostgresqlDatasource
  ): Promise<{}[]> {
    return await this.prisma
      .$queryRaw`SELECT ${selectList} FROM ${datasource.schema}.${table} ORDER BY ${selectList} DESC LIMIT ${rows} OFFSET ${offset}`;
  }

  /* End */
}
