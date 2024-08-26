import {BadRequestException} from '@nestjs/common';
import {Prisma} from '@prisma/client';
import {generateHash} from '@framework/utilities/common.util';
import {
  verifyEmail,
  verifyPassword,
} from '@microservices/account/account.validator';

export async function userPrismaMiddleware(
  params: Prisma.MiddlewareParams,
  next: (params: Prisma.MiddlewareParams) => Promise<any>
) {
  console.log('[user prisma middleware]');
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

        if (params.args['data']['profile']) {
          params.args['data']['profile'][params.action]['fullName'] =
            params.args['data']['profile'][params.action]['firstName'] +
            ' ' +
            (params.args['data']['profile'][params.action]['middleName']
              ? params.args['data']['profile'][params.action]['middleName'] +
                ' '
              : '') +
            params.args['data']['profile'][params.action]['lastName'];
        }
        return next(params);
      default:
        return next(params);
    }
  } else if (
    params.model === Prisma.ModelName.UserSingleProfile ||
    params.model === Prisma.ModelName.UserMultiProfile
  ) {
    switch (params.action) {
      case 'create':
      case 'update':
        if (params.args['data']['dateOfBirth']) {
          params.args['data']['dateOfBirth'] = new Date(
            params.args['data']['dateOfBirth'].toString()
          );
        }

        if (
          params.args['data']['firstName'] &&
          params.args['data']['lastName']
        ) {
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
