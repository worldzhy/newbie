import {INestApplication, Injectable, OnModuleInit} from '@nestjs/common';
import {Prisma, PrismaClient} from '@prisma/client';
import {prismaMiddleware} from './prisma.middleware';
import {CustomLoggerService} from '../../microservices/logger/logger.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
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
    this.$on<any>('query', this.queryEventHandler);
    this.$on<any>('info', this.infoEventHandler);
    this.$on<any>('warn', this.warnEventHandler);
    this.$on<any>('error', this.errorEventHandler);

    // Register middlewares.
    this.$use(prismaMiddleware);
  }

  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }

  private queryEventHandler(e: Prisma.QueryEvent) {
    this.logger.log('👇👇👇');
    this.logger.log(`time: ${e.timestamp}`, this.loggerContext);
    this.logger.log(`query: ${e.query}`, this.loggerContext);
    this.logger.log(`params: ${e.params}`, this.loggerContext);
    this.logger.log(`duration: ${e.duration} ms`, this.loggerContext);
    this.logger.log(`target: ${e.target}`, this.loggerContext);
    this.logger.log('');
  }

  private infoEventHandler(e: Prisma.LogEvent) {
    const message = `${e.timestamp} >> ${e.message} >> [Target] ${e.target}`;
    this.logger.log(message);
  }

  private warnEventHandler(e: Prisma.LogEvent) {
    const message = `${e.timestamp} >> ${e.message} >> [Target] ${e.target}`;
    this.logger.warn(message, this.loggerContext);
  }

  private errorEventHandler(e: Prisma.LogEvent) {
    const message = `${e.timestamp} >> ${e.message} >> [Target] ${e.target}`;
    this.logger.error(message, this.loggerContext);
  }
}
