import {Injectable} from '@nestjs/common';
import {Prisma, PostgresqlDatasourceConstraint} from '@prisma/client';
import {PrismaService} from '../../../../../_prisma/_prisma.service';

@Injectable()
export class PostgresqlDatasourceConstraintService {
  private prisma: PrismaService = new PrismaService();

  async findMany(params: Prisma.PostgresqlDatasourceConstraintFindManyArgs) {
    const {skip, take, where, orderBy, select} = params;
    return await this.prisma.postgresqlDatasourceConstraint.findMany(params);
  }

  async create(
    params: Prisma.PostgresqlDatasourceConstraintCreateArgs
  ): Promise<PostgresqlDatasourceConstraint> {
    try {
      return await this.prisma.postgresqlDatasourceConstraint.create(params);
    } catch (error) {
      return error;
    }
  }

  async createMany(
    params: Prisma.PostgresqlDatasourceConstraintCreateManyArgs
  ): Promise<number> {
    const result = await this.prisma.postgresqlDatasourceConstraint.createMany(
      params
    );

    return result.count;
  }

  async update(
    params: Prisma.PostgresqlDatasourceConstraintUpdateArgs
  ): Promise<PostgresqlDatasourceConstraint> {
    return await this.prisma.postgresqlDatasourceConstraint.update(params);
  }

  async delete(
    params: Prisma.PostgresqlDatasourceConstraintDeleteArgs
  ): Promise<PostgresqlDatasourceConstraint> {
    return await this.prisma.postgresqlDatasourceConstraint.delete(params);
  }

  async deleteMany(
    where: Prisma.PostgresqlDatasourceConstraintWhereInput
  ): Promise<number> {
    const result = await this.prisma.postgresqlDatasourceConstraint.deleteMany({
      where,
    });

    return result.count;
  }
  /* End */
}
