import {
  BadRequestException,
  INestApplication,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import {Prisma, PrismaClient} from '@prisma/client';
import {prismaMiddleware} from '@toolkit/prisma/prisma.middleware';
import {CustomLoggerService} from '@toolkit/logger/logger.service';

@Injectable()
export class PrismaService
  extends PrismaClient<
    Prisma.PrismaClientOptions,
    'query' | 'info' | 'warn' | 'error' | 'beforeExit'
  >
  implements OnModuleInit
{
  private loggerContext = 'Prisma';

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

    // Register middlewares.
    this.$use(prismaMiddleware);
    // this.$extends({
    //   name: 'query-extension-usr',
    //   query: {
    //     user: {
    //       async create({args, query}) {
    //         if (args.data.email) {
    //           if (!verifyEmail(args.data.email)) {
    //             throw new BadRequestException('Your email is not valid.');
    //           }
    //           args.data.email = args.data.email.toLowerCase();
    //         }

    //         if (args.data.password) {
    //           if (!verifyPassword(args.data.password)) {
    //             throw new BadRequestException(
    //               'The password is not strong enough. (length >= 8, lowercase >= 1, uppercase >= 1, numbers >= 1, symbols >= 1)'
    //             );
    //           }
    //           // Generate hash of the password.
    //           const hash = await generateHash(args.data.password);
    //           args.data.password = hash;
    //         }

    //         return query(args);
    //       },
    //       async update({args, query}) {
    //         if (args.data.email) {
    //           if (!verifyEmail(args.data.email as string)) {
    //             throw new BadRequestException('Your email is not valid.');
    //           }
    //           args.data.email = (args.data.email as string).toLowerCase();
    //         }

    //         if (args.data.password) {
    //           if (!verifyPassword(args.data.password as string)) {
    //             throw new BadRequestException(
    //               'The password is not strong enough. (length >= 8, lowercase >= 1, uppercase >= 1, numbers >= 1, symbols >= 1)'
    //             );
    //           }
    //           // Generate hash of the password.
    //           const hash = await generateHash(args.data.password as string);
    //           args.data.password = hash;
    //         }

    //         return query(args);
    //       },
    //     },
    //   },
    // });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }

  async findManyWithPagination(
    model: Prisma.ModelName,
    params: any,
    pagination: {
      page?: number;
      pageSize?: number;
    }
  ) {
    const modelLowercaseFirstLetter =
      model.charAt(0).toLowerCase() + model.slice(1);
    const {skip, take} = this.getSkipAndTake({
      page: pagination.page,
      pageSize: pagination.pageSize,
    });

    const [records, total] = await this.$transaction([
      this[modelLowercaseFirstLetter].findMany({...params, take, skip}),
      this[modelLowercaseFirstLetter].count({where: params.where}),
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

  private getSkipAndTake(params: {
    page: number | undefined;
    pageSize: number | undefined;
  }) {
    let take: number | undefined, skip: number | undefined;
    if (params.page && params.pageSize) {
      if (params.page > 0 && params.pageSize > 0) {
        skip = params.pageSize * (params.page - 1);
        take = params.pageSize;
      } else {
        throw new BadRequestException(
          'The page and pageSize must be larger than 0.'
        );
      }
    } else {
      skip = undefined;
      take = undefined;
    }

    return {skip, take};
  }
}
