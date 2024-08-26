import {Prisma} from '@prisma/client';
import {generateRandomNumbers} from '@framework/utilities/common.util';

export async function awsResourceStackPrismaMiddleware(
  params: Prisma.MiddlewareParams,
  next: (params: Prisma.MiddlewareParams) => Promise<any>
) {
  if (params.model === Prisma.ModelName.AwsResourceStack) {
    // [middleware] Set the default stack name. AWS Infrastructure stack name must satisfy regular expression pattern: "[a-zA-Z][-a-zA-Z0-9]*".
    if (params.action === 'create') {
      if (!params.args['data']['name']) {
        params.args['data']['name'] = (
          params.args['data']['type'] +
          '-' +
          generateRandomNumbers(8)
        ).replace(/_/g, '-');
      }
    }
    return next(params);
  }

  return next(params);
}
