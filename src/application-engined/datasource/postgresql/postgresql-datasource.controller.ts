import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {
  PostgresqlDatasource,
  PostgresqlDatasourceConstraint,
  PostgresqlDatasourceConstraintKeyType,
  PostgresqlDatasourceState,
  PostgresqlDatasourceTable,
  Prisma,
} from '@prisma/client';
import {PostgresqlDatasourceTableColumnService} from './column/column.service';
import {PostgresqlDatasourceService} from './postgresql-datasource.service';
import {PostgresqlDatasourceTableService} from './table/table.service';
import {PrismaService} from '@toolkit/prisma/prisma.service';

enum ConstraintType {
  PRIMARY_KEY = 'PRIMARY KEY',
  FOREIGN_KEY = 'FOREIGN KEY',
  CHECK = 'CHECK',
}

@ApiTags('Datasource - Postgresql')
@ApiBearerAuth()
@Controller('postgresql-datasources')
export class PostgresqlDatasourceController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly postgresqlDatasourceService: PostgresqlDatasourceService,
    private readonly postgresqlDatasourceTableService: PostgresqlDatasourceTableService,
    private readonly postgresqlDatasourceTableColumnService: PostgresqlDatasourceTableColumnService
  ) {}

  @Post('')
  @ApiBody({
    description:
      "The 'host', 'port', 'database' and 'schema' are required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          host: '24.323.232.23',
          port: 5432,
          database: 'postgres',
          schema: 'public',
        },
      },
    },
  })
  async createPostgresqlDatasource(
    @Body()
    body: {
      host: string;
      port: number;
      database: string;
      schema: string;
    }
  ): Promise<PostgresqlDatasource> {
    return await this.prisma.postgresqlDatasource.create({data: body});
  }

  @Get('')
  async getPostgresqlDatasources(): Promise<PostgresqlDatasource[]> {
    return await this.prisma.postgresqlDatasource.findMany({
      orderBy: {
        _relevance: {
          fields: ['database'],
          search: 'database',
          sort: 'asc',
        },
      },
    });
  }

  @Get(':datasourceId')
  async getPostgresqlDatasource(
    @Param('datasourceId') datasourceId: string
  ): Promise<PostgresqlDatasource | null> {
    return await this.prisma.postgresqlDatasource.findUnique({
      where: {id: datasourceId},
    });
  }

  @Patch(':datasourceId')
  @ApiBody({
    description: 'Update postgresql datasource.',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          host: '12.323.232.23',
          port: 5432,
          database: 'postgres',
          schema: 'public',
        },
      },
    },
  })
  async updatePostgresqlDatasource(
    @Param('datasourceId') datasourceId: string,
    @Body() body: {host: string; port: number; database: string}
  ): Promise<PostgresqlDatasource> {
    return await this.prisma.postgresqlDatasource.update({
      where: {id: datasourceId},
      data: {...body},
    });
  }

  @Delete(':datasourceId')
  async deletePostgresqlDatasourceTable(
    @Param('datasourceId') datasourceId: string
  ): Promise<PostgresqlDatasource> {
    return await this.prisma.postgresqlDatasource.delete({
      where: {id: datasourceId},
    });
  }

  @Patch(':datasourceId/load')
  async loadPostgresqlDatasource(
    @Param('datasourceId') datasourceId: string
  ): Promise<PostgresqlDatasource> {
    // * [step 1] Get the postgresql.
    const datasource = await this.prisma.postgresqlDatasource.findUnique({
      where: {id: datasourceId},
    });
    if (!datasource) {
      throw new NotFoundException('Not found the datasource.');
    }

    // * [step 2] Check if the datasource has been loaded.
    const count = await this.prisma.postgresqlDatasourceTable.count({
      where: {datasourceId: datasourceId},
    });
    if (count > 0) {
      throw new BadRequestException(
        'The datasource can not be loaded again before it has been unloaded.'
      );
    }

    // * [step 3] Select and save tables and columns.
    const tables =
      await this.postgresqlDatasourceService.selectTables(datasource);
    for (let i = 0; i < tables.length; i++) {
      // Save a table.
      const table = await this.prisma.postgresqlDatasourceTable.create({
        data: {
          name: tables[i].name,
          schema: tables[i].schema,
          datasource: {connect: {id: datasource.id}},
        },
        include: {datasource: true},
      });

      // Get columns of a table.
      const columns =
        await this.postgresqlDatasourceService.selectColumns(table);

      // Save columns of a table.
      await this.prisma.postgresqlDatasourceTableColumn.createMany({
        data: columns.map(column => {
          return {
            name: column.column_name,
            type: column.data_type,
            ordinalPosition: column.ordinal_position,
            tableId: table.id,
          };
        }),
      });
    }

    // * [step 4] Select and save constraints.
    // [step 4-1] Prepare constraint_name, constraint_type.
    const tableConstraints =
      await this.postgresqlDatasourceService.selectTableConstraints(datasource);

    // [step 4-2] Prepare foreign table_name.
    const constraintColumnUsages =
      await this.postgresqlDatasourceService.selectConstraintColumnUsages(
        datasource
      );

    // [step 4-3] Prepare key column usages.
    const keyColumnUsages =
      await this.postgresqlDatasourceService.selectKeyColumnUsages(datasource);

    // [step 4-4] Construct constraints.
    const constraints: Prisma.PostgresqlDatasourceConstraintCreateManyInput[] =
      [];
    keyColumnUsages.forEach(keyColumnUsage => {
      // Prepare columnKeyType and foreignTable for a relation.
      let keyType: PostgresqlDatasourceConstraintKeyType;
      let foreignTable: string | undefined = undefined;

      const constraint = tableConstraints.find(tableConstraint => {
        return (
          tableConstraint.constraint_name === keyColumnUsage.constraint_name
        );
      });

      if (
        constraint &&
        constraint.constraint_type === ConstraintType.PRIMARY_KEY
      ) {
        keyType = PostgresqlDatasourceConstraintKeyType.PRIMARY_KEY;
      } else {
        keyType = PostgresqlDatasourceConstraintKeyType.FOREIGN_KEY;

        // foreignTable is required if the keyColumn is a foreign key.
        const constraintUsage = constraintColumnUsages.find(
          constraintColumnUsage => {
            return (
              constraintColumnUsage.constraint_name ===
              keyColumnUsage.constraint_name
            );
          }
        );

        foreignTable = constraintUsage ? constraintUsage.table_name : undefined;
      }

      // Finish a constraint.
      constraints.push({
        schema: keyColumnUsage.table_schema,
        table: keyColumnUsage.table_name,
        keyColumn: keyColumnUsage.column_name,
        keyType: keyType,
        foreignTable: foreignTable,
        datasourceId: datasource.id,
      });
    });

    // [step 4-5] Save constraints.
    await this.prisma.postgresqlDatasourceConstraint.createMany({
      data: constraints,
    });

    // * [step 5] Update datasource state.
    return await this.prisma.postgresqlDatasource.update({
      where: {id: datasource.id},
      data: {state: PostgresqlDatasourceState.LOADED},
    });
  }

  /**
   * Unload a postgresql datasource.
   */
  @Patch(':datasourceId/unload')
  async unloadPostgresqlDatasource(
    @Param('datasourceId') datasourceId: string
  ): Promise<PostgresqlDatasource> {
    // [step 1] Get the postgresql.
    const datasource = await this.prisma.postgresqlDatasource.findUnique({
      where: {id: datasourceId},
    });
    if (!datasource) {
      throw new NotFoundException('Not found the datasource.');
    }

    // [step 2] Delete tables and their columns.
    await this.prisma.postgresqlDatasourceTable.deleteMany({
      where: {datasourceId: datasource.id},
    });

    // [step 3] Delete constraints.
    await this.prisma.postgresqlDatasourceConstraint.deleteMany({
      where: {datasourceId: datasource.id},
    });

    // [step 4] Update datasource state.
    return await this.prisma.postgresqlDatasource.update({
      where: {id: datasource.id},
      data: {state: PostgresqlDatasourceState.NOT_LOADED},
    });
  }

  @Get(':datasourceId/tables')
  async getPostgresqlDatasourceTables(
    @Param('datasourceId') datasourceId: string
  ): Promise<PostgresqlDatasource> {
    return await this.prisma.postgresqlDatasource.findUniqueOrThrow({
      where: {id: datasourceId},
      include: {tables: true},
    });
  }

  @Get(':datasourceId/constraints')
  async getPostgresqlDatasourceConstraints(
    @Param('datasourceId')
    datasourceId: string
  ): Promise<PostgresqlDatasource> {
    return await this.prisma.postgresqlDatasource.findUniqueOrThrow({
      where: {id: datasourceId},
      include: {constraints: true},
    });
  }

  @Get(':datasourceId/constraints/:tableName')
  async getPostgresqlDatasourceConstraintsByTable(
    @Param('datasourceId') datasourceId: string,
    @Param('tableName') tableName: string
  ): Promise<PostgresqlDatasourceConstraint[]> {
    // [step 1] Get datasource.
    const datasource = await this.prisma.postgresqlDatasource.findUnique({
      where: {id: datasourceId},
    });
    if (!datasource) {
      throw new NotFoundException('Not found the datasource.');
    }

    // [step 2] Get columns group by table.
    return await this.prisma.postgresqlDatasourceConstraint.findMany({
      where: {
        AND: {
          datasourceId: datasource.id,
          table: tableName,
        },
      },
    });
  }

  /**
   * Overview a postgresql datasource.
   */
  @Get(':datasourceId/overview')
  async overviewPostgresqlDatasource(
    @Param('datasourceId') datasourceId: string
  ): Promise<{
    host: string;
    port: number;
    database: string;
    schema: string;
    tableCount: number;
    tables: {
      id: number;
      name: string;
      numberOfRecords: number;
      hasMany: {}[];
      belongsTo: {}[];
    }[];
  }> {
    const tableSummaries: {
      id: number;
      name: string;
      numberOfRecords: number;
      hasMany: {}[];
      belongsTo: {}[];
    }[] = [];

    // * [step 1] Get the postgresql.
    const datasource = await this.prisma.postgresqlDatasource.findUnique({
      where: {id: datasourceId},
      include: {tables: true},
    });
    if (!datasource) {
      throw new NotFoundException('Not found the datasource.');
    }

    // * [step 2] Construct each table's summary.
    const tables = datasource['tables'] as PostgresqlDatasourceTable[];
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];

      let constraints: PostgresqlDatasourceConstraint[];
      let countResult: {count: bigint}[];
      const childTables: {name: string; numberOfRecords: number}[] = [];
      const parentTables: {name: string; numberOfRecords: number}[] = [];

      // [step 2-1] Get and construct child tables.
      constraints = await this.prisma.postgresqlDatasourceConstraint.findMany({
        where: {foreignTable: table.name},
      });

      await Promise.all(
        constraints.map(async constraint => {
          countResult = await this.postgresqlDatasourceService.countTable(
            constraint.table
          );

          childTables.push({
            name: constraint.table,
            numberOfRecords: Number(countResult[0].count),
          });
        })
      );

      // [step 2-2] Get and construct parent tables.
      constraints = (await this.prisma.postgresqlDatasourceConstraint.findMany({
        where: {AND: {table: table.name, foreignTable: {not: null}}},
      })) as PostgresqlDatasourceConstraint[];

      await Promise.all(
        constraints.map(async constraint => {
          countResult = await this.postgresqlDatasourceService.countTable(
            constraint.foreignTable!
          );

          parentTables.push({
            name: constraint.foreignTable!,
            numberOfRecords: Number(countResult[0].count),
          });
        })
      );

      // [step 2-3] Construct table records.
      countResult = await this.postgresqlDatasourceService.countTable(
        table.name
      );

      tableSummaries.push({
        id: table.id,
        name: table.name,
        numberOfRecords: Number(countResult[0].count),
        hasMany: childTables,
        belongsTo: parentTables,
      });
    }

    // * [step 3] Construct overview information.
    return {
      host: datasource.host,
      port: datasource.port,
      database: datasource.database,
      schema: datasource.schema,
      tableCount: tables.length,
      tables: tableSummaries,
    };
  }

  /* End */
}
