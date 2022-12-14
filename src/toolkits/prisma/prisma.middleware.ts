import {BadRequestException} from '@nestjs/common';
import {Prisma} from '@prisma/client';
import {generateHash} from '../utilities/common.util';
import * as validator from '../../toolkits/validators/user.validator';

export async function prismaMiddleware(
  params: Prisma.MiddlewareParams,
  next: (params: Prisma.MiddlewareParams) => Promise<any>
) {
  if (params.model === Prisma.ModelName.User) {
    switch (params.action) {
      case 'create':
      case 'update':
        if (params.args['data']['email']) {
          if (!validator.verifyEmail(params.args['data']['email'])) {
            throw new BadRequestException('Your email is not valid.');
          }
          params.args['data']['email'] = (
            params.args['data']['email'] as string
          ).toLowerCase();
        }
        if (params.args['data']['password']) {
          if (!validator.verifyPassword(params.args['data']['password'])) {
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
  } else if (params.model === Prisma.ModelName.Candidate) {
    switch (params.action) {
      case 'create':
        params.args['data']['profile']['create']['fullName'] =
          params.args['data']['profile']['create']['givenName'] +
          ' ' +
          (params.args['data']['profile']['create']['middleName']
            ? params.args['data']['profile']['create']['middleName'] + ' '
            : '') +
          params.args['data']['profile']['create']['familyName'];
        return next(params);
      case 'update':
        params.args['data']['profile']['update']['fullName'] =
          params.args['data']['profile']['update']['givenName'] +
          ' ' +
          (params.args['data']['profile']['update']['middleName']
            ? params.args['data']['profile']['update']['middleName'] + ' '
            : '') +
          params.args['data']['profile']['update']['familyName'];
        return next(params);
      default:
        return next(params);
    }
  }

  return next(params);
}
