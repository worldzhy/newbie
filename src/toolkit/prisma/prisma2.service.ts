import {
  BadRequestException,
  INestApplication,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import {Prisma, PrismaClient} from '.prisma/client2';
import {CustomLoggerService} from '@toolkit/logger/logger.service';

@Injectable()
export class Prisma2Service
  extends PrismaClient<
    Prisma.PrismaClientOptions,
    'query' | 'info' | 'warn' | 'error' | 'beforeExit'
  >
  implements OnModuleInit
{
  private loggerContext = 'Prisma2';

  constructor(private readonly logger: CustomLoggerService) {
    super({
      /* About log levels
        -query:	Logs all queries run by Prisma.
          Example:
            prisma:query SELECT "public"."User"."id", "public"."User"."email" FROM "public"."User" WHERE ("public"."User"."id") IN (SELECT "t0"."id" FROM "public"."User" AS "t0" INNER JOIN "public"."Post" AS "j0" ON ("j0"."authorId") = ("t0"."id") WHERE ("j0"."views" > $1 AND "t0"."id" IS NOT NULL)) OFFSET $2
        -info:
          -Example:
            prisma:info Started http server on http://127.0.0.1:58471
        -warn:	Warnings.
        -error:	Errors.
        */

      // We care about 'info', 'warn' and 'error' levels among [info, query, warn, error].
      log: [
        // Use 'query' level for debugging.
        // {emit: 'event', level: 'query'},
        {emit: 'event', level: 'info'},
        {emit: 'event', level: 'warn'},
        {emit: 'event', level: 'error'},
      ],
    });

    // Register event handlers.
    this.$on('query', (e: Prisma.QueryEvent) => {
      this.logger.log('👇👇👇');
      this.logger.log(`time: ${e.timestamp}`, this.loggerContext);
      this.logger.log(`query: ${e.query}`, this.loggerContext);
      this.logger.log(`params: ${e.params}`, this.loggerContext);
      this.logger.log(`duration: ${e.duration} ms`, this.loggerContext);
      this.logger.log(`target: ${e.target}`, this.loggerContext);
      this.logger.log('');
    });

    this.$on('info', (e: Prisma.LogEvent) => {
      const message = `${e.timestamp} >> ${e.message} >> [Target] ${e.target}`;
      this.logger.log(message, this.loggerContext);
    });

    this.$on('warn', (e: Prisma.LogEvent) => {
      const message = `${e.timestamp} >> ${e.message} >> [Target] ${e.target}`;
      this.logger.warn(message, this.loggerContext);
    });

    this.$on('error', (e: Prisma.LogEvent) => {
      const message = `${e.timestamp} >> ${e.message} >> [Target] ${e.target}`;
      this.logger.error(message, this.loggerContext);
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }

  async findManyInOnePage(params: {
    model: Prisma.ModelName;
    findManyArgs?: any;
  }) {
    const {model, findManyArgs} = params;
    const modelLowercaseFirstLetter =
      model.charAt(0).toLowerCase() + model.slice(1);

    const records = await this[modelLowercaseFirstLetter].findMany({
      ...findManyArgs,
    });

    return {
      records,
      pagination: {
        page: 0,
        pageSize: records.length,
        countOfCurrentPage: records.length,
        countOfTotal: records.length,
      },
    };
  }

  async findManyInManyPages(params: {
    model: Prisma.ModelName;
    pagination: {
      page: number; // The page number starts from 0.
      pageSize: number;
    };
    findManyArgs?: any;
  }) {
    const {model, pagination, findManyArgs} = params;
    const modelLowercaseFirstLetter =
      model.charAt(0).toLowerCase() + model.slice(1);

    const {skip, take} = this.getSkipAndTake(pagination);

    const [records, total] = await this.$transaction([
      this[modelLowercaseFirstLetter].findMany({...findManyArgs, take, skip}),
      this[modelLowercaseFirstLetter].count({
        where: findManyArgs ? findManyArgs.where : undefined,
      }),
    ]);

    return {
      records,
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        countOfCurrentPage: records.length,
        countOfTotal: total,
      },
    };
  }

  private getSkipAndTake(params: {page: number; pageSize: number}) {
    const {page, pageSize} = params;

    if (page >= 0 && pageSize > 0) {
      return {
        skip: pageSize * page,
        take: pageSize,
      };
    } else {
      throw new BadRequestException(
        'The minimum page is 0 and the pageSize must be larger than 0.'
      );
    }
  }
}
