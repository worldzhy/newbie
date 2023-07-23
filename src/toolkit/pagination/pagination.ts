import {BadRequestException} from '@nestjs/common';

export function generatePaginationParams(params: {
  page: number | undefined;
  pageSize: number | undefined;
}) {
  // [step 2] Construct take and skip arguments.
  let take: number, skip: number;
  if (params.page && params.pageSize) {
    if (params.page > 0 && params.pageSize > 0) {
      take = params.pageSize;
      skip = params.pageSize * (params.page - 1);
    } else {
      throw new BadRequestException(
        'The page and pageSize must be larger than 0.'
      );
    }
  } else {
    take = 10;
    skip = 0;
  }

  return {take, skip};
}

export function generatePaginationResponse(params: {
  page?: number;
  pageSize?: number;
  records: any[];
  total: number;
}) {
  // Return with pagination information.
  if (params.page && params.pageSize) {
    if (params.page > 0 && params.pageSize > 0) {
      return {
        records: params.records,
        pagination: {
          page: params.page,
          pageSize: params.pageSize,
          countOfCurrentPage: params.records.length,
          countOfTotal: params.total,
        },
      };
    }
  }

  // Return without pagination information.
  return params.records;
}
