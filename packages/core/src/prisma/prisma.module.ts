import {DynamicModule, Global, Provider} from '@nestjs/common';
import {PrismaService} from './prisma.service';
import {CreateExtendedPrismaClientOptions, createExtendedPrismaClient} from './prisma.extension';

export type PrismaModuleOptions = CreateExtendedPrismaClientOptions;

/**
 * PrismaModule must be registered with forRoot() so the project can supply
 * its own generated PrismaClient constructor:
 *
 *   PrismaModule.forRoot({PrismaClient})
 */
@Global()
export class PrismaModule {
  static forRoot(options: PrismaModuleOptions): DynamicModule {
    const prismaServiceProvider: Provider = {
      provide: PrismaService,
      useFactory: async () => {
        const client = createExtendedPrismaClient(options);

        /**
         * Manually bind NestJS lifecycle hooks to the extended Prisma client.
         * Since the extended client is a plain object, we attach the hooks directly.
         */
        (client as any).onModuleInit = async () => {
          await (client as any).$connect();
        };

        (client as any).onModuleDestroy = async () => {
          await (client as any).$disconnect();
        };

        return client;
      },
    };

    return {
      global: true,
      module: PrismaModule,
      providers: [prismaServiceProvider],
      exports: [PrismaService],
    };
  }
}
