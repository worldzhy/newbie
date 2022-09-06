import {Injectable} from '@nestjs/common';
import {
  Prisma,
  PostgresqlDatasourceTableRelation,
  PostgresqlDatasource,
  PostgresqlDatasourceTableRelationColumnKeyType,
} from '@prisma/client';
import {PrismaService} from '../../../../_prisma/_prisma.service';

enum ConstraintType {
  PRIMARY_KEY = 'PRIMARY KEY',
  FOREIGN_KEY = 'FOREIGN KEY',
  CHECK = 'CHECK',
}

@Injectable()
export class PostgresqlDatasourceTableRelationService {
  private prisma: PrismaService = new PrismaService();

  /**
   * Generate the table relations of the schema.
   * @param datasource
   * @returns
   */
  async extract(datasource: PostgresqlDatasource) {
    // [step 1-1] Prepare constraint_name, constraint_type
    const tableConstraints: [] = await this.prisma
      .$queryRaw`SELECT * FROM information_schema.table_constraints WHERE (constraint_schema = ${datasource.schema})`;

    // [step 1-2] Prepare foreign table_name
    const constraintColumnUsages: [] = await this.prisma
      .$queryRaw`SELECT * FROM information_schema.constraint_column_usage WHERE (constraint_schema = ${datasource.schema})`;

    // [step 2] Struct relations
    const keyColumnUsages: any[] = await this.prisma
      .$queryRaw`SELECT * FROM information_schema.key_column_usage WHERE (constraint_schema = ${datasource.schema})`;

    let relations: Prisma.PostgresqlDatasourceTableRelationCreateManyInput[] =
      [];
    keyColumnUsages.map((keyColumnUsage: any) => {
      // Prepare columnKeyType and foreignTable for a relation.
      let columnKeyType: PostgresqlDatasourceTableRelationColumnKeyType;
      let foreignTable: string | undefined = undefined;

      const constraint: any = tableConstraints.find((tableConstraint: any) => {
        return (
          tableConstraint.constraint_name === keyColumnUsage.constraint_name
        );
      });

      if (constraint.constraint_type === ConstraintType.PRIMARY_KEY) {
        columnKeyType =
          PostgresqlDatasourceTableRelationColumnKeyType.PRIMARY_KEY;
      } else {
        columnKeyType =
          PostgresqlDatasourceTableRelationColumnKeyType.FOREIGN_KEY;

        // foreignTable is required if the keyColumn is a foreign key.
        const constraintUsage: any = constraintColumnUsages.find(
          (constraintColumnUsage: any) => {
            return (
              constraintColumnUsage.constraint_name ===
              keyColumnUsage.constraint_name
            );
          }
        );
        foreignTable = constraintUsage.table_name;
      }

      // Finish a relation.
      relations.push({
        schema: keyColumnUsage.table_schema,
        table: keyColumnUsage.table_name,
        column: keyColumnUsage.column_name,
        columnKeyType: columnKeyType,
        foreignTable: foreignTable,
        datasourceId: datasource.id,
      });
    });

    return await this.createMany(relations);
  }

  /**
   * Get many postgresqlDatasource table relations.
   *
   * @param {{
   *     skip?: number;
   *     take?: number;
   *     where?: Prisma.PostgresqlDatasourceTableRelationWhereInput;
   *     orderBy?: Prisma.PostgresqlDatasourceTableRelationOrderByWithRelationAndSearchRelevanceInput;
   *     select?: Prisma.PostgresqlDatasourceTableRelationSelect;
   *   }} params
   * @returns
   * @memberof PostgresqlDatasourceTableRelationService
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.PostgresqlDatasourceTableRelationWhereInput;
    orderBy?: Prisma.PostgresqlDatasourceTableRelationOrderByWithRelationAndSearchRelevanceInput;
    select?: Prisma.PostgresqlDatasourceTableRelationSelect;
  }) {
    const {skip, take, where, orderBy, select} = params;
    return await this.prisma.postgresqlDatasourceTableRelation.findMany({
      skip,
      take,
      where,
      orderBy,
      select,
    });
  }

  /**
   * Create a postgresql datasource  table relation.
   *
   * @param {Prisma.PostgresqlDatasourceTableRelationCreateInput} data
   * @returns {Promise<PostgresqlDatasourceTableRelation>}
   * @memberof PostgresqlDatasourceTableRelationService
   */
  async create(
    data: Prisma.PostgresqlDatasourceTableRelationCreateInput
  ): Promise<PostgresqlDatasourceTableRelation> {
    return await this.prisma.postgresqlDatasourceTableRelation.create({
      data,
    });
  }

  /**
   * Create many postgresql datasource table relations.
   * @param data
   * @returns
   */
  async createMany(
    data: Prisma.PostgresqlDatasourceTableRelationCreateManyInput[]
  ) {
    const result =
      await this.prisma.postgresqlDatasourceTableRelation.createMany({data});
    return result.count;
  }

  /**
   * Update a postgresqlDatasourceTableRelation
   *
   * @param {{
   *     where: Prisma.PostgresqlDatasourceTableRelationWhereUniqueInput;
   *     data: Prisma.PostgresqlDatasourceTableRelationUpdateInput;
   *   }} params
   * @returns {Promise<PostgresqlDatasourceTableRelation>}
   * @memberof PostgresqlDatasourceTableRelationService
   */
  async update(params: {
    where: Prisma.PostgresqlDatasourceTableRelationWhereUniqueInput;
    data: Prisma.PostgresqlDatasourceTableRelationUpdateInput;
  }): Promise<PostgresqlDatasourceTableRelation> {
    const {where, data} = params;
    return await this.prisma.postgresqlDatasourceTableRelation.update({
      data,
      where,
    });
  }

  /**
   * Delete a postgresql datasource table relation
   *
   * @param {Prisma.PostgresqlDatasourceTableRelationWhereUniqueInput} where
   * @returns {Promise<PostgresqlDatasourceTableRelation>}
   * @memberof PostgresqlDatasourceTableRelationService
   */
  async delete(
    where: Prisma.PostgresqlDatasourceTableRelationWhereUniqueInput
  ): Promise<PostgresqlDatasourceTableRelation> {
    return await this.prisma.postgresqlDatasourceTableRelation.delete({
      where,
    });
  }

  /* End */
}
