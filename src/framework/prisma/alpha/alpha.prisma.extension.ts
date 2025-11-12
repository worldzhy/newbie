import {BadRequestException} from '@nestjs/common';
import {Prisma} from '@prisma/client';

export const prismaExtension = Prisma.defineExtension({
  model: {
    $allModels: {
      async findManyInOnePage<T>(this: T, findManyArgs: Prisma.Args<T, 'findMany'>) {
        // Get the current model at runtime
        const model = Prisma.getExtensionContext(this);

        const records = await (model as any).findMany(findManyArgs);

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
      async findManyInManyPages<T>(
        this: T,
        params: {
          pagination: {
            page: number; // The page number starts from 0.
            pageSize: number;
          };
          findManyArgs: Prisma.Args<T, 'findMany'>;
        }
      ) {
        // Get the current model at runtime
        const model = Prisma.getExtensionContext(this);

        const {pagination, findManyArgs} = params;
        const {page, pageSize} = pagination;
        let skip = 0;
        let take = 0;
        if (page >= 0 && pageSize > 0) {
          skip = pageSize * page;
          take = pageSize;
        } else {
          throw new BadRequestException('The minimum page is 0 and the pageSize must be larger than 0.');
        }

        const records = await (model as any).findMany({
          ...findManyArgs,
          take,
          skip,
        });
        const total = await (model as any).count({
          where: findManyArgs ? findManyArgs.where : undefined,
        });

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
  },
});
