import {Injectable} from '@nestjs/common';
import {
  Prisma,
  PostgresqlDatasourceConstraint,
  PostgresqlDatasource,
  PostgresqlDatasourceConstraintColumnKeyType,
} from '@prisma/client';
import {PrismaService} from '../../../../../_prisma/_prisma.service';

@Injectable()
export class PostgresqlDatasourceConstraintService {
  private prisma: PrismaService = new PrismaService();

  /**
   * Get many postgresql datasource constraints.
   *
   * @param {{
   *     skip?: number;
   *     take?: number;
   *     where?: Prisma.PostgresqlDatasourceConstraintWhereInput;
   *     orderBy?: Prisma.PostgresqlDatasourceConstraintOrderByWithRelationAndSearchRelevanceInput;
   *     select?: Prisma.PostgresqlDatasourceConstraintSelect;
   *   }} params
   * @returns
   * @memberof PostgresqlDatasourceConstraintService
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.PostgresqlDatasourceConstraintWhereInput;
    orderBy?: Prisma.PostgresqlDatasourceConstraintOrderByWithRelationAndSearchRelevanceInput;
    select?: Prisma.PostgresqlDatasourceConstraintSelect;
  }) {
    const {skip, take, where, orderBy, select} = params;
    return await this.prisma.postgresqlDatasourceConstraint.findMany({
      skip,
      take,
      where,
      orderBy,
      select,
    });
  }

  /**
   * Create a postgresql datasource constraint.
   *
   * @param {Prisma.PostgresqlDatasourceConstraintCreateInput} data
   * @returns {Promise<PostgresqlDatasourceConstraint>}
   * @memberof PostgresqlDatasourceConstraintService
   */
  async create(
    data: Prisma.PostgresqlDatasourceConstraintCreateInput
  ): Promise<PostgresqlDatasourceConstraint> {
    return await this.prisma.postgresqlDatasourceConstraint.create({
      data,
    });
  }

  /**
   * Create many postgresql datasource constraints.
   * @param data
   * @returns
   */
  async createMany(
    data: Prisma.PostgresqlDatasourceConstraintCreateManyInput[]
  ): Promise<number> {
    const result = await this.prisma.postgresqlDatasourceConstraint.createMany({
      data,
    });

    return result.count;
  }

  /**
   * Update a postgresql datasource constraint.
   *
   * @param {{
   *     where: Prisma.PostgresqlDatasourceConstraintWhereUniqueInput;
   *     data: Prisma.PostgresqlDatasourceConstraintUpdateInput;
   *   }} params
   * @returns {Promise<PostgresqlDatasourceConstraint>}
   * @memberof PostgresqlDatasourceConstraintService
   */
  async update(params: {
    where: Prisma.PostgresqlDatasourceConstraintWhereUniqueInput;
    data: Prisma.PostgresqlDatasourceConstraintUpdateInput;
  }): Promise<PostgresqlDatasourceConstraint> {
    const {where, data} = params;
    return await this.prisma.postgresqlDatasourceConstraint.update({
      data,
      where,
    });
  }

  /**
   * Delete a postgresql datasource constraint.
   * @returns {Promise<PostgresqlDatasourceConstraint>}
   * @memberof PostgresqlDatasourceConstraintService
   */
  async delete(params: {
    where: Prisma.PostgresqlDatasourceConstraintWhereUniqueInput;
    include?: Prisma.PostgresqlDatasourceConstraintInclude;
  }): Promise<PostgresqlDatasourceConstraint> {
    return await this.prisma.postgresqlDatasourceConstraint.delete(params);
  }

  /**
   * Delete many postgresql datasource constraints.
   *
   * @param {Prisma.PostgresqlDatasourceConstraintWhereInput} where
   * @returns {Promise<PostgresqlDatasourceConstraint>}
   * @memberof PostgresqlDatasourceConstraintService
   */
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
