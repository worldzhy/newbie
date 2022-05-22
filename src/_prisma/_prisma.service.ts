import {INestApplication, Injectable, OnModuleInit} from '@nestjs/common';
import {PrismaClient} from '@prisma/client';
import {CustomLoggerService} from '../_logger/_custom-logger.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new CustomLoggerService('Prisma');

  constructor() {
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
        {emit: 'event', level: 'info'},
        {emit: 'event', level: 'warn'},
        {emit: 'event', level: 'error'},
      ],
    });
  }

  async onModuleInit() {
    /* About event type */
    this.$on<any>('info', this.infoCallback);
    this.$on<any>('warn', this.warnCallback);
    this.$on<any>('error', this.errorCallback);

    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }

  private infoCallback = (e: any) => {
    const message = `${e.message} | ${e.target} | ${e.timestamp}`;
    this.logger.log(message);
  };
  private warnCallback = (e: any) => {
    const message = `${e.message} | ${e.target} | ${e.timestamp}`;
    this.logger.warn(message);
  };
  private errorCallback = (e: any) => {
    const message = `${e.message} | ${e.target} | ${e.timestamp}`;
    this.logger.error(message);
  };
}
