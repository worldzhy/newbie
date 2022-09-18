import {Injectable} from '@nestjs/common';
import {Prisma, PostgresqlDatasourceConstraint} from '@prisma/client';
import {PrismaService} from '../../../../../toolkits/prisma/prisma.service';

@Injectable()
export class PostgresqlDatasourceConstraintService {
  private prisma: PrismaService = new PrismaService();

  async findMany(params: Prisma.PostgresqlDatasourceConstraintFindManyArgs) {
    return await this.prisma.postgresqlDatasourceConstraint.findMany(params);
  }

  async create(
    params: Prisma.PostgresqlDatasourceConstraintCreateArgs
  ): Promise<PostgresqlDatasourceConstraint> {
    return await this.prisma.postgresqlDatasourceConstraint.create(params);
  }

  async createMany(
    params: Prisma.PostgresqlDatasourceConstraintCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.postgresqlDatasourceConstraint.createMany(params);
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
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.postgresqlDatasourceConstraint.deleteMany({
      where,
    });
  }
  /* End */
}
