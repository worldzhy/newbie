import {Injectable} from '@nestjs/common';
import {
  Prisma,
  PostgresqlDatasourceTable,
  PostgresqlDatasourceConstraint,
} from '@prisma/client';
import {PrismaService} from '../../../../_prisma/_prisma.service';
import {PostgresqlDatasourceConstraintService} from '../../datasource/postgresql/constraint/constraint.service';

@Injectable()
export class DatapipePumpService {
  private prisma: PrismaService = new PrismaService();
  private postgresqlDatasourceConstraintService =
    new PostgresqlDatasourceConstraintService();

  async probe(table: PostgresqlDatasourceTable) {
    // [step 1] Get the total count of the table records.
    console.log('-----------');
    console.log(table.name);
    const tableName = table.name;
    const p = 'public';
    const count = await this.prisma.$queryRawUnsafe(
      'SELECT COUNT(*) FROM $1 LIMIT 10',
      tableName
    );

    let constraints: PostgresqlDatasourceConstraint[];

    // [step 2] Get constraints in which the table records are the parent objects.
    constraints = (await this.postgresqlDatasourceConstraintService.findMany({
      where: {foreignTable: table.name},
    })) as PostgresqlDatasourceConstraint[];
    const hasMany = constraints.map(constraint => constraint.table);

    // [step 3] Get constraints in which the table records are the child objects.
    constraints = (await this.postgresqlDatasourceConstraintService.findMany({
      where: {AND: {table: table.name, foreignTable: {not: null}}},
    })) as PostgresqlDatasourceConstraint[];
    const belongsTo = constraints.map(constraint => constraint.foreignTable);

    return {
      tatal: count,
      hasMany: hasMany,
      belongsTo: belongsTo,
    };
  }

  /* End */
}
