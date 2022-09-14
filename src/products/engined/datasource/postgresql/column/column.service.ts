import {Injectable} from '@nestjs/common';
import {PostgresqlDatasourceTableColumn, Prisma} from '@prisma/client';
import {PrismaService} from '../../../../../_prisma/_prisma.service';

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
    data: Prisma.PostgresqlDatasourceTableColumnCreateInput
  ): Promise<PostgresqlDatasourceTableColumn> {
    return await this.prisma.postgresqlDatasourceTableColumn.create({
      data,
    });
  }

  async createMany(
    data: Prisma.PostgresqlDatasourceTableColumnCreateManyInput[]
  ): Promise<number> {
    const result = await this.prisma.postgresqlDatasourceTableColumn.createMany(
      {data}
    );
    return result.count;
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
  ): Promise<number> {
    const result = await this.prisma.postgresqlDatasourceTableColumn.deleteMany(
      params
    );

    return result.count;
  }

  /* End */
}
