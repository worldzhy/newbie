import {BadRequestException} from '@nestjs/common';
import {Prisma} from '@prisma/client';
import {generateHash} from '../utilities/common.util';
import {verifyEmail, verifyPassword} from '../validators/user.validator';

export async function prismaMiddleware(
  params: Prisma.MiddlewareParams,
  next: (params: Prisma.MiddlewareParams) => Promise<any>
) {
  if (params.model === Prisma.ModelName.User) {
    switch (params.action) {
      case 'create':
      case 'update':
        if (params.args['data']['email']) {
          if (!verifyEmail(params.args['data']['email'])) {
            throw new BadRequestException('Your email is not valid.');
          }
          params.args['data']['email'] = (
            params.args['data']['email'] as string
          ).toLowerCase();
        }
        if (params.args['data']['password']) {
          if (!verifyPassword(params.args['data']['password'])) {
            throw new BadRequestException(
              'The password is not strong enough. (length >= 8, lowercase >= 1, uppercase >= 1, numbers >= 1, symbols >= 1)'
            );
          }
          // Generate hash of the password.
          const hash = await generateHash(params.args['data']['password']);
          params.args['data']['password'] = hash;
        }
        return next(params);
      default:
        // Handle existed issue https://github.com/prisma/prisma/issues/17470
        // if (params.action.toString() === 'findUniqueOrThrow') {
        //   const result = await next(params);
        //   if (result) {
        //     const {password, ...newUser} = result;
        //     return newUser;
        //   }
        //   return null;
        // }
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
  } else if (params.model === Prisma.ModelName.TcWorkflow) {
    switch (params.action) {
      case 'update':
        if (params.args['data']['firstName']) {
          params.args['data']['fullName'] =
            params.args['data']['firstName'] +
            ' ' +
            (params.args['data']['middleName']
              ? params.args['data']['middleName'] + ' '
              : '') +
            params.args['data']['lastName'];
        }
        return next(params);
      default:
        return next(params);
    }
  }

  return next(params);
}
