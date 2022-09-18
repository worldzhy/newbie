import {Injectable} from '@nestjs/common';
import {PostgresqlDatasourceTableColumn, Prisma} from '@prisma/client';
import {PrismaService} from '../../../../../toolkits/prisma/prisma.service';

@Injectable()
export class PostgresqlDatasourceTableColumnService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(
    params: Prisma.PostgresqlDatasourceTableColumnFindUniqueArgs
  ): Promise<PostgresqlDatasourceTableColumn | null> {
    return await this.prisma.postgresqlDatasourceTableColumn.findUnique(params);
  }

  async findMany(
    params: Prisma.PostgresqlDatasourceTableColumnFindManyArgs
  ): Promise<PostgresqlDatasourceTableColumn[]> {
    return await this.prisma.postgresqlDatasourceTableColumn.findMany(params);
  }

  async create(
    params: Prisma.PostgresqlDatasourceTableColumnCreateArgs
  ): Promise<PostgresqlDatasourceTableColumn> {
    return await this.prisma.postgresqlDatasourceTableColumn.create(params);
  }

  async createMany(
    params: Prisma.PostgresqlDatasourceTableColumnCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.postgresqlDatasourceTableColumn.createMany(params);
  }

  async update(
    params: Prisma.PostgresqlDatasourceTableColumnUpdateArgs
  ): Promise<PostgresqlDatasourceTableColumn> {
    return await this.prisma.postgresqlDatasourceTableColumn.update(params);
  }

  async delete(
    params: Prisma.PostgresqlDatasourceTableColumnDeleteArgs
  ): Promise<PostgresqlDatasourceTableColumn> {
    return await this.prisma.postgresqlDatasourceTableColumn.delete(params);
  }

  async deleteMany(
    params: Prisma.PostgresqlDatasourceTableColumnDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.postgresqlDatasourceTableColumn.deleteMany(params);
  }

  /* End */
}
