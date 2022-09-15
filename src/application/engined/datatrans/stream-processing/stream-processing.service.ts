import {Injectable} from '@nestjs/common';
import {DatatransPipeline, PostgresqlDatasourceTable} from '@prisma/client';
import {PrismaService} from '../../../../toolkits/prisma/prisma.service';

@Injectable()
export class DatatransStreamProcessingService {
  private prisma: PrismaService = new PrismaService();

  async start(pipeline: DatatransPipeline) {
    const fromTable = pipeline['fromTable'] as PostgresqlDatasourceTable;
    const hasManyTables = pipeline.hasManyTables;
    const belongsToTables = pipeline.belongsToTables;

    this.prisma.$queryRawUnsafe(`SELECT * FROM "${fromTable.name}"`);
    return true;
  }

  /* End */
}
