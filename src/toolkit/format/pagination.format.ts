export function formatPaginationResponse(params: {
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
