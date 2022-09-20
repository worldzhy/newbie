import {Injectable} from '@nestjs/common';
import {
  PostgresqlDatasource,
  PostgresqlDatasourceConstraint,
  PostgresqlDatasourceConstraintKeyType,
  PostgresqlDatasourceState,
  PostgresqlDatasourceTable,
  Prisma,
} from '@prisma/client';
import {PrismaService} from '../../../../toolkits/prisma/prisma.service';
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

  async findUnique(
    params: Prisma.PostgresqlDatasourceFindUniqueArgs
  ): Promise<PostgresqlDatasource | null> {
    return await this.prisma.postgresqlDatasource.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.PostgresqlDatasourceFindUniqueOrThrowArgs
  ): Promise<PostgresqlDatasource> {
    return await this.prisma.postgresqlDatasource.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.PostgresqlDatasourceFindManyArgs
  ): Promise<PostgresqlDatasource[]> {
    return await this.prisma.postgresqlDatasource.findMany(params);
  }

  async create(
    params: Prisma.PostgresqlDatasourceCreateArgs
  ): Promise<PostgresqlDatasource> {
    return await this.prisma.postgresqlDatasource.create(params);
  }

  async update(
    params: Prisma.PostgresqlDatasourceUpdateArgs
  ): Promise<PostgresqlDatasource> {
    return await this.prisma.postgresqlDatasource.update(params);
  }

  async delete(
    params: Prisma.PostgresqlDatasourceDeleteArgs
  ): Promise<PostgresqlDatasource> {
    return await this.prisma.postgresqlDatasource.delete(params);
  }

  /**
   * Extract tables, columns and constraints.
   */
  async load(datasource: PostgresqlDatasource): Promise<PostgresqlDatasource> {
    //*[step 1] Extract tables and columns.
    // [step 1-1] Prepare table names.
    const tables = await this.prisma.$queryRaw<
      {table_name: string}[]
    >`SELECT table_name FROM information_schema.tables WHERE (table_schema = ${datasource.schema})`;
    const tableNames = tables.flatMap(item =>
      item.table_name === '_prisma_migrations' ? [] : item.table_name
    );

    // [step 1-2] Loop to save tables and columns.
    for (let i = 0; i < tableNames.length; i++) {
      // Save a table.
      const table = await this.postgresqlDatasourceTableService.create({
        data: {
          name: tableNames[i],
          datasource: {connect: {id: datasource.id}},
        },
      });

      // Get columns of a table.
      const columns = await this.prisma.$queryRaw<
        {column_name: string; data_type: string; ordinal_position: number}[]
      >`SELECT * FROM information_schema.columns WHERE (table_schema = ${datasource.schema} AND table_name = ${tableNames[i]})`;

      // Save columns of a table.
      await this.postgresqlDatasourceTableColumnService.createMany({
        data: columns.map(column => {
          return {
            name: column.column_name,
            type: column.data_type,
            ordinalPosition: column.ordinal_position,
            tableId: table.id,
          };
        }),
      });
    }

    //*[step 2] Extract constraints.
    // [step 2-1] Prepare constraint_name, constraint_type
    const tableConstraints = await this.prisma.$queryRaw<
      {constraint_name: string; constraint_type: string}[]
    >`SELECT * FROM information_schema.table_constraints WHERE (constraint_schema = ${datasource.schema})`;

    // [step 2-2] Prepare foreign table_name
    const constraintColumnUsages = await this.prisma.$queryRaw<
      {constraint_name: string; table_name: string}[]
    >`SELECT * FROM information_schema.constraint_column_usage WHERE (constraint_schema = ${datasource.schema})`;

    // [step 2-3] Construct constraints
    const constraints: Prisma.PostgresqlDatasourceConstraintCreateManyInput[] =
      [];
    const keyColumnUsages = await this.prisma.$queryRaw<
      {
        constraint_name: string;
        table_schema: string;
        table_name: string;
        column_name: string;
      }[]
    >`SELECT * FROM information_schema.key_column_usage WHERE (constraint_schema = ${datasource.schema})`;

    keyColumnUsages.map(keyColumnUsage => {
      // Prepare columnKeyType and foreignTable for a relation.
      let keyType: PostgresqlDatasourceConstraintKeyType;
      let foreignTable: string | undefined = undefined;

      const constraint = tableConstraints.find(tableConstraint => {
        return (
          tableConstraint.constraint_name === keyColumnUsage.constraint_name
        );
      });

      if (
        constraint &&
        constraint.constraint_type === ConstraintType.PRIMARY_KEY
      ) {
        keyType = PostgresqlDatasourceConstraintKeyType.PRIMARY_KEY;
      } else {
        keyType = PostgresqlDatasourceConstraintKeyType.FOREIGN_KEY;

        // foreignTable is required if the keyColumn is a foreign key.
        const constraintUsage = constraintColumnUsages.find(
          constraintColumnUsage => {
            return (
              constraintColumnUsage.constraint_name ===
              keyColumnUsage.constraint_name
            );
          }
        );

        foreignTable = constraintUsage ? constraintUsage.table_name : undefined;
      }

      // Finish a relation.
      constraints.push({
        schema: keyColumnUsage.table_schema,
        table: keyColumnUsage.table_name,
        keyColumn: keyColumnUsage.column_name,
        keyType: keyType,
        foreignTable: foreignTable,
        datasourceId: datasource.id,
      });
    });

    // [step 2-4] Save constraints.
    await this.postgresqlDatasourceConstraintService.createMany({
      data: constraints,
    });

    // [step 3] Update datasource state.
    return await this.prisma.postgresqlDatasource.update({
      where: {id: datasource.id},
      data: {state: PostgresqlDatasourceState.LOADED},
    });
  }

  /**
   * Clear constraints, tables and their columns.
   */
  async unload(
    datasource: PostgresqlDatasource
  ): Promise<PostgresqlDatasource> {
    // [step 1] Delete tables and their columns.
    await this.postgresqlDatasourceTableService.deleteMany({
      where: {datasourceId: datasource.id},
    });

    // [step 2] Delete constraints.
    await this.postgresqlDatasourceConstraintService.deleteMany({
      datasourceId: datasource.id,
    });

    // [step 3] Update datasource state.
    return await this.prisma.postgresqlDatasource.update({
      where: {id: datasource.id},
      data: {state: PostgresqlDatasourceState.NOT_LOADED},
    });
  }

  /**
   * Overview postgresql datasource.
   */
  async overview(datasource: PostgresqlDatasource): Promise<{
    host: string;
    port: number;
    database: string;
    schema: string;
    tableCount: number;
    tables: {
      id: number;
      name: string;
      numberOfRecords: number;
      hasMany: {}[];
      belongsTo: {}[];
    }[];
  }> {
    const tables = datasource['tables'] as PostgresqlDatasourceTable[];
    const tableSummaries: {
      id: number;
      name: string;
      numberOfRecords: number;
      hasMany: {}[];
      belongsTo: {}[];
    }[] = [];

    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];

      let constraints: PostgresqlDatasourceConstraint[];
      let countResult: {count: bigint}[];
      const childTables: {name: string; numberOfRecords: number}[] = [];
      const parentTables: {name: string; numberOfRecords: number}[] = [];

      //*[step 1] Get information of child tables.
      // [step 1-1] Get child tables's names.
      constraints = (await this.postgresqlDatasourceConstraintService.findMany({
        where: {foreignTable: table.name},
      })) as PostgresqlDatasourceConstraint[];

      // [step 1-2] Construct information of the child tables.
      await Promise.all(
        constraints.map(async constraint => {
          countResult = await this.prisma.$queryRawUnsafe(
            `SELECT COUNT(*) FROM "${constraint.table}"`
          );

          childTables.push({
            name: constraint.table,
            numberOfRecords: Number(countResult[0].count),
          });
        })
      );

      //*[step 2] Get information of parent tables.
      // [step 2-1] Get parent tables' name.
      constraints = (await this.postgresqlDatasourceConstraintService.findMany({
        where: {AND: {table: table.name, foreignTable: {not: null}}},
      })) as PostgresqlDatasourceConstraint[];

      // [step 2-2] Construct information of the parent tables.
      await Promise.all(
        constraints.map(async constraint => {
          countResult = await this.prisma.$queryRawUnsafe(
            `SELECT COUNT(*) FROM "${constraint.foreignTable}"`
          );

          parentTables.push({
            name: constraint.foreignTable!,
            numberOfRecords: Number(countResult[0].count),
          });
        })
      );

      //*[step 3] Get the total count of the table records.
      countResult = await this.prisma.$queryRawUnsafe(
        `SELECT COUNT(*) FROM "${table.name}"`
      );

      tableSummaries.push({
        id: table.id,
        name: table.name,
        numberOfRecords: Number(countResult[0].count),
        hasMany: childTables,
        belongsTo: parentTables,
      });
    }

    return {
      host: datasource.host,
      port: datasource.port,
      database: datasource.database,
      schema: datasource.schema,
      tableCount: tables.length,
      tables: tableSummaries,
    };
  }

  async getTables(datasource: PostgresqlDatasource): Promise<unknown> {
    return await this.prisma
      .$queryRaw`SELECT * FROM information_schema.tables WHERE (table_schema = ${datasource.schema})`;
  }

  async getTriggers(datasource: PostgresqlDatasource): Promise<{}[]> {
    const result: {}[] = await this.prisma
      .$queryRaw`SELECT * FROM information_schema.triggers WHERE event_object_schema = ${datasource.schema}`;

    const triggers: {}[] = [];
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
    rows = 5000,
    offset = 0,
    datasource: PostgresqlDatasource
  ): Promise<unknown> {
    return await this.prisma
      .$queryRaw`SELECT ${selectList} FROM ${datasource.schema}.${table} ORDER BY ${selectList} DESC LIMIT ${rows} OFFSET ${offset}`;
  }

  /* End */
}
