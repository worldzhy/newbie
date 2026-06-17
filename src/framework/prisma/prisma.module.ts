import {Global, Module} from '@nestjs/common';
import {PrismaService} from './prisma.service';
import {createExtendedPrismaClient} from './prisma.extension';

@Global()
@Module({
  providers: [
    {
      provide: PrismaService,
      useFactory: async () => {
        const client = createExtendedPrismaClient();

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
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule {}
