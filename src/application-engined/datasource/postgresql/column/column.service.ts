import {Injectable} from '@nestjs/common';
import {PostgresqlDatasourceTableColumn, Prisma} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class PostgresqlDatasourceTableColumnService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    params: Prisma.PostgresqlDatasourceTableColumnCreateArgs
  ): Promise<PostgresqlDatasourceTableColumn> {
    // [middleware] The tableId from HTTP request is string type. Convert it to number type.
    this.prisma.$use(async (params, next) => {
      if (params.model === 'PostgresqlDatasourceTableColumn') {
        if (params.action === 'create') {
          if (
            params.args['data']['tableId'] &&
            typeof params.args['data']['tableId'] === 'string'
          ) {
            params.args['data']['tableId'] = parseInt(
              params.args['data']['tableId']
            );
          }
        }
      }
      return next(params);
    });

    return await this.prisma.postgresqlDatasourceTableColumn.create(params);
  }

  // ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄ //
  //    ! Postgresql table operations      //
  // ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄ //

  async addColulmn(column: {
    table: string;
    name: string;
    type: string;
    constraint?: string | null;
  }): Promise<void> {
    const sql = column.constraint
      ? `ALTER TABLE ${column.table}
    ADD COLUMN ${column.name} ${column.type} ${column.constraint};`
      : `ALTER TABLE ${column.table}
    ADD COLUMN ${column.name} ${column.type};`;

    await this.prisma.$executeRawUnsafe(sql);
  }

  async dropColulmn(column: PostgresqlDatasourceTableColumn): Promise<void> {
    await this.prisma.$executeRawUnsafe(
      `ALTER TABLE ${column['table'].name}
      DROP COLUMN ${column.name};`
    );
  }

  /* End */
}
