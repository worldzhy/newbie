import {BadRequestException, Logger} from '@nestjs/common';
import {Prisma, PrismaClient} from '@generated/prisma/client';
import {PrismaPg} from '@prisma/adapter-pg';

/**
 * Helper function to calculate pagination parameters.
 */
function getSkipAndTake(params: {page: number; pageSize: number}) {
  const {page, pageSize} = params;
  if (page >= 0 && pageSize > 0) {
    return {
      skip: pageSize * page,
      take: pageSize,
    };
  } else {
    throw new BadRequestException('The minimum page is 0 and the pageSize must be larger than 0.');
  }
}

/**
 * Factory function to create an extended Prisma Client.
 */
export const createExtendedPrismaClient = () => {
  const logger = new Logger('Prisma');

  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.PRISMA_DATABASE_URL as string,
    }),
  });

  const extendedClient = prisma.$extends({
    client: {
      async findManyInOnePage(params: {model: Prisma.ModelName; findManyArgs?: any}) {
        const {findManyArgs} = params;
        const model = params.model as string;
        const modelLowercaseFirstLetter = model.charAt(0).toLowerCase() + model.slice(1);

        const currentClient = this as any;
        const records = await currentClient[modelLowercaseFirstLetter].findMany({
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
      },

      async findManyInManyPages(params: {
        model: Prisma.ModelName;
        pagination: {page: number; pageSize: number};
        findManyArgs?: any;
      }) {
        const {pagination, findManyArgs} = params;
        const model = params.model as string;
        const modelLowercaseFirstLetter = model.charAt(0).toLowerCase() + model.slice(1);
        const {skip, take} = getSkipAndTake(pagination);

        const currentClient = this as any;

        const [records, total] = await currentClient.$transaction([
          currentClient[modelLowercaseFirstLetter].findMany({...findManyArgs, take, skip}),
          currentClient[modelLowercaseFirstLetter].count({
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
      },
    },
  });

  return extendedClient;
};

/**
 * Manual type definition to ensure IDE intellisense works correctly.
 * This inherits from the base PrismaClient and adds custom method signatures.
 */
export type ExtendedPrismaClient = PrismaClient & {
  findManyInOnePage: (params: {model: Prisma.ModelName; findManyArgs?: any}) => Promise<any>;
  findManyInManyPages: (params: {
    model: Prisma.ModelName;
    pagination: {page: number; pageSize: number};
    findManyArgs?: any;
  }) => Promise<any>;
};
