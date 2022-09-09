import {Injectable} from '@nestjs/common';
import {
  Prisma,
  Datapipe,
  PostgresqlDatasourceConstraint,
  PostgresqlDatasourceTable,
} from '@prisma/client';
import {PrismaService} from '../../../_prisma/_prisma.service';
import {PostgresqlDatasourceConstraintService} from '../datasource/postgresql/constraint/constraint.service';

@Injectable()
export class DatapipeService {
  private prisma: PrismaService = new PrismaService();
  private postgresqlDatasourceConstraintService =
    new PostgresqlDatasourceConstraintService();

  /**
   * Get a datapipe
   * @param {{
   *  where: Prisma.DatapipeWhereUniqueInput;
   *  include?: Prisma.DatapipeInclude;
   * }} params
   * @returns {(Promise<Datapipe | null>)}
   * @memberof DatapipeService
   */
  async findOne(params: {
    where: Prisma.DatapipeWhereUniqueInput;
    include?: Prisma.DatapipeInclude;
  }): Promise<Datapipe | null> {
    return await this.prisma.datapipe.findUnique(params);
  }

  /**
   * Get many datapipes
   *
   * @param {{
   *     skip?: number;
   *     take?: number;
   *     where?: Prisma.DatapipeWhereInput;
   *     orderBy?: Prisma.DatapipeOrderByWithRelationAndSearchRelevanceInput;
   *     select?: Prisma.DatapipeSelect;
   *   }} params
   * @returns
   * @memberof DatapipeService
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.DatapipeWhereInput;
    orderBy?: Prisma.DatapipeOrderByWithRelationAndSearchRelevanceInput;
    select?: Prisma.DatapipeSelect;
  }) {
    const {skip, take, where, orderBy, select} = params;
    return await this.prisma.datapipe.findMany({
      skip,
      take,
      where,
      orderBy,
      select,
    });
  }

  /**
   * Check if exist
   *
   * @param {string} id
   * @returns
   * @memberof DatapipeService
   */
  async checkExistence(id: string) {
    const count = await this.prisma.datapipe.count({
      where: {id},
    });
    return count > 0 ? true : false;
  }

  /**
   * Create a datapipe
   *
   * @param {Prisma.DatapipeCreateInput} data
   * @returns {Promise<Datapipe>}
   * @memberof DatapipeService
   */
  async create(data: Prisma.DatapipeCreateInput): Promise<Datapipe> {
    return await this.prisma.datapipe.create({
      data,
    });
  }

  /**
   * Update a datapipe
   *
   * @param {{
   *     where: Prisma.DatapipeWhereUniqueInput;
   *     data: Prisma.DatapipeUpdateInput;
   *   }} params
   * @returns {Promise<Datapipe>}
   * @memberof DatapipeService
   */
  async update(params: {
    where: Prisma.DatapipeWhereUniqueInput;
    data: Prisma.DatapipeUpdateInput;
  }): Promise<Datapipe> {
    const {where, data} = params;
    return await this.prisma.datapipe.update({
      data,
      where,
    });
  }

  /**
   * Delete a datapipe
   *
   * @param {Prisma.DatapipeWhereUniqueInput} where
   * @returns {Promise<Datapipe>}
   * @memberof DatapipeService
   */
  async delete(where: Prisma.DatapipeWhereUniqueInput): Promise<Datapipe> {
    return await this.prisma.datapipe.delete({
      where,
    });
  }

  async probe(fromTable: PostgresqlDatasourceTable) {
    let constraints: PostgresqlDatasourceConstraint[];
    let countResult: {count: bigint}[];

    // [step 1] Get information of child tables.
    let childTables: {name: string; total: string}[] = [];

    // [step 1-1] Get child tables's names.
    constraints = (await this.postgresqlDatasourceConstraintService.findMany({
      where: {foreignTable: fromTable.name},
    })) as PostgresqlDatasourceConstraint[];

    // [step 1-2] Struct information of the child tables.
    await Promise.all(
      constraints.map(async constraint => {
        countResult = await this.prisma.$queryRawUnsafe(
          `SELECT COUNT(*) FROM "${constraint.table}"`
        );
        childTables.push({
          name: constraint.table,
          total: countResult[0].count.toString(),
        });
      })
    );

    // [step 2] Get information of parent tables.
    let parentTables: {name: string; total: string}[] = [];

    // [step 2-1] Get parent tables' name.
    constraints = (await this.postgresqlDatasourceConstraintService.findMany({
      where: {AND: {table: fromTable.name, foreignTable: {not: null}}},
    })) as PostgresqlDatasourceConstraint[];

    // [step 2-2] Struct information of the parent tables.
    await Promise.all(
      constraints.map(async constraint => {
        countResult = await this.prisma.$queryRawUnsafe(
          `SELECT COUNT(*) FROM "${constraint.foreignTable}"`
        );
        parentTables.push({
          name: constraint.foreignTable!,
          total: countResult[0].count.toString(),
        });
      })
    );

    // [step 3] Get the total count of the table records.
    countResult = await this.prisma.$queryRawUnsafe(
      `SELECT COUNT(*) FROM "${fromTable.name}"`
    );

    return {
      table: {name: fromTable.name, total: countResult[0].count.toString()},
      hasMany: childTables,
      belongsTo: parentTables,
    };
  }
  /* End */
}
