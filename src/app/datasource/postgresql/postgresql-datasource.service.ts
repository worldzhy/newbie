import {Injectable} from '@nestjs/common';
import {
  PostgresqlDatasource,
  PostgresqlDatasourceConstraintColumnKeyType,
  PostgresqlDatasourceTable,
  Prisma,
} from '@prisma/client';
import {PrismaService} from '../../../_prisma/_prisma.service';
import {PostgresqlDatasourceTableColumnService} from './column/column.service';
import {PostgresqlDatasourceConstraintService} from './constraint/constraint.service';
import {PostgresqlDatasourceTableService} from './table/table.service';

enum ConstraintType {
  PRIMARY_KEY = 'PRIMARY KEY',
  FOREIGN_KEY = 'FOREIGN KEY',
  CHECK = 'CHECK',
}

@Injectable()
export class PostgresqlDatasourceService {
  private prisma: PrismaService = new PrismaService();
  private postgresqlDatasourceConstraintService =
    new PostgresqlDatasourceConstraintService();
  private postgresqlDatasourceTableService =
    new PostgresqlDatasourceTableService();
  private postgresqlDatasourceTableColumnService =
    new PostgresqlDatasourceTableColumnService();

  /**
   * Extract tables, columns and constraints.
   * @param datasource
   * @returns
   */
  async mount(datasource: PostgresqlDatasource) {
    // [step 1] Extract tables and columns.

    // [step 1-1] Prepare table names.
    const tables: any[] = await this.prisma
      .$queryRaw`SELECT table_name FROM information_schema.tables WHERE (table_schema = ${datasource.schema})`;
    const tableNames = tables.flatMap(item =>
      item.table_name === '_prisma_migrations' ? [] : item.table_name
    );

    // [step 1-2] Loop to save tables and columns.
    for (let i = 0; i < tableNames.length; i++) {
      // Save a table.
      const table = await this.postgresqlDatasourceTableService.create({
        name: tableNames[i],
        datasource: {connect: {id: datasource.id}},
      });

      // Get columns of a table.
      const columns: any[] = await this.prisma
        .$queryRaw`SELECT * FROM information_schema.columns WHERE (table_schema = ${datasource.schema} AND table_name = ${tableNames[i]})`;

      // Save columns of a table.
      await this.postgresqlDatasourceTableColumnService.createMany(
        columns.map(column => {
          return {
            column: column.column_name,
            columnType: column.data_type,
            ordinalPosition: column.ordinal_position,
            tableId: table.id,
          };
        })
      );
    }

    // [step 2] Extract constraints.

    // [step 2-1] Prepare constraint_name, constraint_type
    const tableConstraints: [] = await this.prisma
      .$queryRaw`SELECT * FROM information_schema.table_constraints WHERE (constraint_schema = ${datasource.schema})`;

    // [step 2-2] Prepare foreign table_name
    const constraintColumnUsages: [] = await this.prisma
      .$queryRaw`SELECT * FROM information_schema.constraint_column_usage WHERE (constraint_schema = ${datasource.schema})`;

    // [step 2-3] Struct constraints
    let constraints: Prisma.PostgresqlDatasourceConstraintCreateManyInput[] =
      [];
    const keyColumnUsages: any[] = await this.prisma
      .$queryRaw`SELECT * FROM information_schema.key_column_usage WHERE (constraint_schema = ${datasource.schema})`;

    keyColumnUsages.map((keyColumnUsage: any) => {
      // Prepare columnKeyType and foreignTable for a relation.
      let columnKeyType: PostgresqlDatasourceConstraintColumnKeyType;
      let foreignTable: string | undefined = undefined;

      const constraint: any = tableConstraints.find((tableConstraint: any) => {
        return (
          tableConstraint.constraint_name === keyColumnUsage.constraint_name
        );
      });

      if (constraint.constraint_type === ConstraintType.PRIMARY_KEY) {
        columnKeyType = PostgresqlDatasourceConstraintColumnKeyType.PRIMARY_KEY;
      } else {
        columnKeyType = PostgresqlDatasourceConstraintColumnKeyType.FOREIGN_KEY;

        // foreignTable is required if the keyColumn is a foreign key.
        const constraintUsage: any = constraintColumnUsages.find(
          (constraintColumnUsage: any) => {
            return (
              constraintColumnUsage.constraint_name ===
              keyColumnUsage.constraint_name
            );
          }
        );
        foreignTable = constraintUsage.table_name;
      }

      // Finish a relation.
      constraints.push({
        schema: keyColumnUsage.table_schema,
        table: keyColumnUsage.table_name,
        column: keyColumnUsage.column_name,
        columnKeyType: columnKeyType,
        foreignTable: foreignTable,
        datasourceId: datasource.id,
      });
    });

    // [step 2-4] Save constraints.
    await this.postgresqlDatasourceConstraintService.createMany(constraints);
  }

  /**
   * Clear tables, columns and constraints.
   * @param datasource
   * @returns
   */
  async unmount(datasource: PostgresqlDatasource) {
    // [step 1] Delete tables and columns.
    const tables: any[] = await this.postgresqlDatasourceTableService.findMany({
      where: {datasourceId: datasource.id},
    });

    for (let i = 0; i < tables.length; i++) {
      await this.postgresqlDatasourceTableService.delete({
        where: {id: tables[i].id},
      });
    }

    // [step 2] Delete constraints.
    await this.postgresqlDatasourceConstraintService.deleteMany({
      datasourceId: datasource.id,
    });
  }

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
