import {Injectable} from '@nestjs/common';
import {
  Prisma,
  DatasourcePostgresqlTableRelation,
  DatasourcePostgresql,
  DatasourcePostgresqlTableRelationColumnKeyType,
} from '@prisma/client';
import {PrismaService} from '../../../../_prisma/_prisma.service';

enum ConstraintType {
  PRIMARY_KEY = 'PRIMARY KEY',
  FOREIGN_KEY = 'FOREIGN KEY',
  CHECK = 'CHECK',
}

@Injectable()
export class DatasourcePostgresqlTableRelationService {
  private prisma: PrismaService = new PrismaService();

  /**
   * Generate the table relations of the schema.
   * @param datasource
   * @returns
   */
  async extract(datasource: DatasourcePostgresql) {
    // [step 1-1] Prepare constraint_name, constraint_type
    const tableConstraints: [] = await this.prisma
      .$queryRaw`SELECT * FROM information_schema.table_constraints WHERE (constraint_schema = ${datasource.schema})`;

    // [step 1-2] Prepare foreign table_name
    const constraintColumnUsages: [] = await this.prisma
      .$queryRaw`SELECT * FROM information_schema.constraint_column_usage WHERE (constraint_schema = ${datasource.schema})`;

    // [step 2] Struct relations
    const keyColumnUsages: any[] = await this.prisma
      .$queryRaw`SELECT * FROM information_schema.key_column_usage WHERE (constraint_schema = ${datasource.schema})`;

    let relations: Prisma.DatasourcePostgresqlTableRelationCreateManyInput[] =
      [];
    keyColumnUsages.map((keyColumnUsage: any) => {
      // Prepare columnKeyType and foreignTable for a relation.
      let columnKeyType: DatasourcePostgresqlTableRelationColumnKeyType;
      let foreignTable: string | undefined = undefined;

      const constraint: any = tableConstraints.find((tableConstraint: any) => {
        return (
          tableConstraint.constraint_name === keyColumnUsage.constraint_name
        );
      });

      if (constraint.constraint_type === ConstraintType.PRIMARY_KEY) {
        columnKeyType =
          DatasourcePostgresqlTableRelationColumnKeyType.PRIMARY_KEY;
      } else {
        columnKeyType =
          DatasourcePostgresqlTableRelationColumnKeyType.FOREIGN_KEY;

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
   * Get many datasourcePostgresql table relations.
   *
   * @param {{
   *     skip?: number;
   *     take?: number;
   *     where?: Prisma.DatasourcePostgresqlTableRelationWhereInput;
   *     orderBy?: Prisma.DatasourcePostgresqlTableRelationOrderByWithRelationAndSearchRelevanceInput;
   *     select?: Prisma.DatasourcePostgresqlTableRelationSelect;
   *   }} params
   * @returns
   * @memberof DatasourcePostgresqlTableRelationService
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.DatasourcePostgresqlTableRelationWhereInput;
    orderBy?: Prisma.DatasourcePostgresqlTableRelationOrderByWithRelationAndSearchRelevanceInput;
    select?: Prisma.DatasourcePostgresqlTableRelationSelect;
  }) {
    const {skip, take, where, orderBy, select} = params;
    return await this.prisma.datasourcePostgresqlTableRelation.findMany({
      skip,
      take,
      where,
      orderBy,
      select,
    });
  }

  /**
   * Create a datasourcePostgresql table relation.
   *
   * @param {Prisma.DatasourcePostgresqlTableRelationCreateInput} data
   * @returns {Promise<DatasourcePostgresqlTableRelation>}
   * @memberof DatasourcePostgresqlTableRelationService
   */
  async create(
    data: Prisma.DatasourcePostgresqlTableRelationCreateInput
  ): Promise<DatasourcePostgresqlTableRelation> {
    return await this.prisma.datasourcePostgresqlTableRelation.create({
      data,
    });
  }

  /**
   * Create many datasourcePostgresql table relations.
   * @param data
   * @returns
   */
  async createMany(
    data: Prisma.DatasourcePostgresqlTableRelationCreateManyInput[]
  ) {
    const result =
      await this.prisma.datasourcePostgresqlTableRelation.createMany({data});
    return result.count;
  }

  /**
   * Update a datasourcePostgresqlTableRelation
   *
   * @param {{
   *     where: Prisma.DatasourcePostgresqlTableRelationWhereUniqueInput;
   *     data: Prisma.DatasourcePostgresqlTableRelationUpdateInput;
   *   }} params
   * @returns {Promise<DatasourcePostgresqlTableRelation>}
   * @memberof DatasourcePostgresqlTableRelationService
   */
  async update(params: {
    where: Prisma.DatasourcePostgresqlTableRelationWhereUniqueInput;
    data: Prisma.DatasourcePostgresqlTableRelationUpdateInput;
  }): Promise<DatasourcePostgresqlTableRelation> {
    const {where, data} = params;
    return await this.prisma.datasourcePostgresqlTableRelation.update({
      data,
      where,
    });
  }

  /**
   * Delete a datasourcePostgresqlTableRelation
   *
   * @param {Prisma.DatasourcePostgresqlTableRelationWhereUniqueInput} where
   * @returns {Promise<DatasourcePostgresqlTableRelation>}
   * @memberof DatasourcePostgresqlTableRelationService
   */
  async delete(
    where: Prisma.DatasourcePostgresqlTableRelationWhereUniqueInput
  ): Promise<DatasourcePostgresqlTableRelation> {
    return await this.prisma.datasourcePostgresqlTableRelation.delete({
      where,
    });
  }

  /* End */
}
