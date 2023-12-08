import {Injectable} from '@nestjs/common';
import {PostgresqlDatasourceTable, Prisma} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class PostgresqlDatasourceTableService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    params: Prisma.PostgresqlDatasourceTableFindUniqueOrThrowArgs
  ): Promise<PostgresqlDatasourceTable> {
    // [middleware] The id from HTTP request is string type. Convert it to number type.
    this.prisma.$use(async (params, next) => {
      if (params.model === 'PostgresqlDatasourceTable') {
        if (params.action === 'findUnique') {
          if (
            params.args['where']['id'] &&
            typeof params.args['where']['id'] === 'string'
          ) {
            params.args['where']['id'] = parseInt(params.args['where']['id']);
          }
        }
      }
      return next(params);
    });

    return await this.prisma.postgresqlDatasourceTable.findUniqueOrThrow(
      params
    );
  }

  async checkExistence(id: number): Promise<boolean> {
    const count = await this.prisma.postgresqlDatasourceTable.count({
      where: {id: id},
    });
    return count > 0 ? true : false;
  }

  // ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄ //
  //    ! Postgresql table operations      //
  // ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄ //

  async createTable(tableName: string) {
    await this.prisma.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS ${tableName} ()`
    );
  }

  async dropTable(tableName: string) {
    await this.prisma.$executeRawUnsafe(
      `DROP TABLE IF EXISTS ${tableName} CASCADE`
    );
  }

  /* End */
}
