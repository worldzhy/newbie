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
        // The client is `let` on purpose: registerExtension rebinds it through
        // $extends so extensions registered after module init (e.g. by feature
        // modules in their service constructors) still take effect. The Proxy
        // below always forwards property access to the CURRENT client.
        let client: any = createExtendedPrismaClient(options);

        const wrapper = {
          // Manually bind NestJS lifecycle hooks to the extended Prisma client.
          async onModuleInit() {
            await client.$connect();
          },
          async onModuleDestroy() {
            await client.$disconnect();
          },
          registerExtension(extension: any) {
            client = client.$extends(extension) as any;
          },
        };

        return new Proxy(wrapper, {
          get: (target, prop) => {
            if (prop in target) {
              return target[prop as keyof typeof target];
            }
            const value = client[prop as keyof typeof client];
            if (typeof value === 'function') {
              return value.bind(client);
            }
            return value;
          },
        });
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
