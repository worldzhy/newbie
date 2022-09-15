import {INestApplication, Injectable, OnModuleInit} from '@nestjs/common';
import {PrismaClient} from '@prisma/client';
import {CustomLoggerService} from '../logger/custom-logger.service';

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
        // Use 'query' level for debugging.
        // {emit: 'event', level: 'query'},
        {emit: 'event', level: 'info'},
        {emit: 'event', level: 'warn'},
        {emit: 'event', level: 'error'},
      ],
    });

    /* About event type */
    this.$on<any>('query', (e: any) => {
      this.logger.log(`👇👇👇`);
      this.logger.log(`time: ${e.timestamp}`);
      this.logger.log(`query: ${e.query}`);
      this.logger.log(`params: ${e.params}`);
      this.logger.log(`duration: ${e.duration} ms`);
      this.logger.log(`target: ${e.target}`);
      this.logger.log('');
    });

    this.$on<any>('info', (e: any) => {
      const message = `${e.timestamp} >> ${e.message} >> [Target] ${e.target}`;
      this.logger.log(message);
    });

    this.$on<any>('warn', (e: any) => {
      const message = `${e.timestamp} >> ${e.message} >> [Target] ${e.target}`;
      this.logger.warn(message);
    });

    this.$on<any>('error', (e: any) => {
      const message = `${e.timestamp} >> ${e.message} >> [Target] ${e.target}`;
      this.logger.error(message);
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
}
