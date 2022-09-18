import {Injectable} from '@nestjs/common';
import {PostgresqlDatasourceTable, Prisma} from '@prisma/client';
import {PrismaService} from '../../../../../toolkits/prisma/prisma.service';

@Injectable()
export class PostgresqlDatasourceTableService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(
    params: Prisma.PostgresqlDatasourceTableFindUniqueArgs
  ): Promise<PostgresqlDatasourceTable | null> {
    return await this.prisma.postgresqlDatasourceTable.findUnique(params);
  }

  async findMany(
    params: Prisma.PostgresqlDatasourceTableFindManyArgs
  ): Promise<PostgresqlDatasourceTable[]> {
    return await this.prisma.postgresqlDatasourceTable.findMany(params);
  }

  async create(
    params: Prisma.PostgresqlDatasourceTableCreateArgs
  ): Promise<PostgresqlDatasourceTable> {
    return await this.prisma.postgresqlDatasourceTable.create(params);
  }

  async createMany(
    params: Prisma.PostgresqlDatasourceTableCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.postgresqlDatasourceTable.createMany(params);
  }

  async update(
    params: Prisma.PostgresqlDatasourceTableUpdateArgs
  ): Promise<PostgresqlDatasourceTable> {
    return await this.prisma.postgresqlDatasourceTable.update(params);
  }

  async delete(
    params: Prisma.PostgresqlDatasourceTableDeleteArgs
  ): Promise<PostgresqlDatasourceTable> {
    return await this.prisma.postgresqlDatasourceTable.delete(params);
  }

  async deleteMany(
    params: Prisma.PostgresqlDatasourceTableDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.postgresqlDatasourceTable.deleteMany(params);
  }

  async count(
    params: Prisma.PostgresqlDatasourceTableCountArgs
  ): Promise<number> {
    return await this.prisma.postgresqlDatasourceTable.count(params);
  }

  async checkExistence(id: number): Promise<boolean> {
    const count = await this.prisma.postgresqlDatasourceTable.count({
      where: {id: id},
    });
    return count > 0 ? true : false;
  }

  /* End */
}
