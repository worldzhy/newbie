import {BadRequestException} from '@nestjs/common';
import {Prisma} from '@prisma/client';
import {generateHash} from '../utilities/common.util';
import {verifyPassword} from '../validators/user.validator';

export async function userMiddleware(
  params: Prisma.MiddlewareParams,
  next: (params: Prisma.MiddlewareParams) => Promise<any>
) {
  if (params.model === Prisma.ModelName.User) {
    switch (params.action) {
      case 'create':
      case 'update':
        if (params.args['data']['password']) {
          if (!verifyPassword(params.args['data']['password'])) {
            throw new BadRequestException('The password is not strong enough.');
          }
          // Generate hash of the password.
          const hash = await generateHash(params.args['data']['password']);
          params.args['data']['password'] = hash;
        }
        return next(params);
      case 'findUnique':
        const result = await next(params);
        if (result) {
          const {password, ...newUser} = result;
          return newUser;
        }
        return null;
      default:
        return next(params);
    }
  }
  return next(params);
}
