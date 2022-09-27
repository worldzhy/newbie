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

@Injectable()
export class PostgresqlDatasourceService {
  private prisma: PrismaService = new PrismaService();

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

  // ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄ //
  //    ! Postgresql table operations      //
  // ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄ //

  async selectTables(datasource: PostgresqlDatasource): Promise<string[]> {
    const tables = await this.prisma.$queryRaw<
      {table_name: string}[]
    >`SELECT table_name FROM information_schema.tables WHERE (table_schema = ${datasource.schema})`;

    return tables.flatMap(item =>
      item.table_name === '_prisma_migrations' ? [] : item.table_name
    );
  }

  async selectColumns(
    table: PostgresqlDatasourceTable
  ): Promise<
    {column_name: string; data_type: string; ordinal_position: number}[]
  > {
    return await this.prisma.$queryRaw<
      {column_name: string; data_type: string; ordinal_position: number}[]
    >`SELECT * FROM information_schema.columns WHERE (table_schema = ${table['datasource'].schema} AND table_name = ${table.name})`;
  }

  async selectTableConstraints(
    datasource: PostgresqlDatasource
  ): Promise<{constraint_name: string; constraint_type: string}[]> {
    return await this.prisma.$queryRaw<
      {constraint_name: string; constraint_type: string}[]
    >`SELECT * FROM information_schema.table_constraints WHERE (constraint_schema = ${datasource.schema})`;
  }

  async selectConstraintColumnUsages(
    datasource: PostgresqlDatasource
  ): Promise<{constraint_name: string; table_name: string}[]> {
    return await this.prisma.$queryRaw<
      {constraint_name: string; table_name: string}[]
    >`SELECT * FROM information_schema.constraint_column_usage WHERE (constraint_schema = ${datasource.schema})`;
  }

  async selectKeyColumnUsages(datasource: PostgresqlDatasource): Promise<
    {
      constraint_name: string;
      table_schema: string;
      table_name: string;
      column_name: string;
    }[]
  > {
    return await this.prisma.$queryRaw<
      {
        constraint_name: string;
        table_schema: string;
        table_name: string;
        column_name: string;
      }[]
    >`SELECT * FROM information_schema.key_column_usage WHERE (constraint_schema = ${datasource.schema})`;
  }

  async countTable(table: string): Promise<{count: bigint}[]> {
    return this.prisma.$queryRawUnsafe<{count: bigint}[]>(
      `SELECT COUNT(*) FROM "${table}"`
    );
  }

  /* End */
}
