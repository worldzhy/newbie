import {Injectable} from '@nestjs/common';
import {Datapipe, PostgresqlDatasourceTable} from '@prisma/client';
import {PrismaService} from '../../../../_prisma/_prisma.service';

@Injectable()
export class DatapipePumpService {
  private prisma: PrismaService = new PrismaService();

  async prepare(datapipe: Datapipe) {
    const fromTable = datapipe['fromTable'] as PostgresqlDatasourceTable;
    let countResult: {count: bigint}[];
    let childTables: {name: string; total: string}[] = [];
    let parentTables: {name: string; total: string}[] = [];
    let recordAverageSize = 1;

    // [step 1] Get the total count of the table records.
    countResult = await this.prisma.$queryRawUnsafe(
      `SELECT COUNT(*) FROM "${fromTable.name}"`
    );
    const total: bigint = countResult[0].count;

    // [step 1] Get the total count of the child tables' records.
    Promise.all(
      // Use 'map' instead of 'forEach'
      // https://www.becomebetterprogrammer.com/javascript-foreach-async-await/
      datapipe.hasManyTables.map(async tableName => {
        countResult = await this.prisma.$queryRawUnsafe(
          `SELECT COUNT(*) FROM "${tableName}"`
        );
        childTables.push({
          name: tableName,
          total: countResult[0].count.toString(),
        });

        // https://stackoverflow.com/questions/54409854/how-to-divide-two-native-javascript-bigints-and-get-a-decimal-result
        recordAverageSize +=
          Number((countResult[0].count * 100n) / total) / 100;
      })
    );

    // [step 2] Get the total count of the parent tables' records.
    await Promise.all(
      datapipe.belongsToTables.map(async tableName => {
        countResult = await this.prisma.$queryRawUnsafe(
          `SELECT COUNT(*) FROM "${tableName}"`
        );
        parentTables.push({
          name: tableName,
          total: countResult[0].count.toString(),
        });

        recordAverageSize += 1;
      })
    );

    return {
      table: {name: fromTable.name, total: total.toString()},
      hasMany: childTables,
      belongsTo: parentTables,
      recordAverageSize: recordAverageSize,
      batches: (
        (total * BigInt(Math.ceil(recordAverageSize))) /
        20n
      ).toString(),
    };
  }

  async start(datapipe: Datapipe) {
    const fromTable = datapipe['fromTable'] as PostgresqlDatasourceTable;
    this.prisma.$queryRawUnsafe(`SELECT * FROM "${fromTable.name}"`);
    return true;
  }

  /* End */
}
