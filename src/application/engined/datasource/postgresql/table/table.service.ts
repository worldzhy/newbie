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
    try {
      return await this.prisma.postgresqlDatasourceTable.create(params);
    } catch (error) {
      return error;
    }
  }

  async createMany(
    params: Prisma.PostgresqlDatasourceTableCreateManyArgs
  ): Promise<number> {
    const result = await this.prisma.postgresqlDatasourceTable.createMany(
      params
    );

    return result.count;
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
  ): Promise<number> {
    const result = await this.prisma.postgresqlDatasourceTable.deleteMany(
      params
    );

    return result.count;
  }

  async count(
    params: Prisma.PostgresqlDatasourceTableCountArgs
  ): Promise<number> {
    return await this.prisma.postgresqlDatasourceTable.count(params);
  }

  /**
   * Check if exist
   *
   * @param {number} id
   * @returns
   * @memberof PostgresqlDatasourceTableService
   */
  async checkExistence(id: number): Promise<boolean> {
    const count = await this.prisma.postgresqlDatasourceTable.count({
      where: {id: id},
    });

    return count > 0 ? true : false;
  }

  /* End */
}
