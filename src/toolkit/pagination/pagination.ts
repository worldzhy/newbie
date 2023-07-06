import {BadRequestException} from '@nestjs/common';

export function generatePaginationParams(params: {
  page: string | undefined;
  pageSize: string | undefined;
}) {
  // [step 2] Construct take and skip arguments.
  let take: number, skip: number;
  if (params.page && params.pageSize) {
    // Actually 'page' is string because it comes from URL param.
    const page = parseInt(params.page);
    const pageSize = parseInt(params.pageSize);
    if (page > 0 && pageSize > 0) {
      take = pageSize;
      skip = pageSize * (page - 1);
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
  records: any[];
  total: number;
  query: object;
}) {
  // Return with pagination information.
  if ('page' in params.query && 'pageSize' in params.query) {
    // Actually 'page' is string because it comes from URL param.
    const page = parseInt(params.query.page as string);
    const pageSize = parseInt(params.query.pageSize as string);
    if (page > 0 && pageSize > 0) {
      return {
        records: params.records,
        pagination: {
          page: page,
          pageSize: pageSize,
          currentNumberOfRecords: params.records.length,
          totalNumberOfRecords: params.total,
        },
      };
    }
  }

  // Return without pagination information.
  return params.records;
}
