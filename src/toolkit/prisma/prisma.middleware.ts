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
  } else if (params.model === Prisma.ModelName.UserProfile) {
    switch (params.action) {
      case 'create':
      case 'update':
        if (params.args['data']['dateOfBirth']) {
          params.args['data']['dateOfBirth'] = new Date(
            params.args['data']['dateOfBirth'].toString()
          );
        }
        return next(params);
      default:
        return next(params);
    }
  } else if (params.model === Prisma.ModelName.Candidate) {
    switch (params.action) {
      case 'create':
        params.args['data']['profile']['create']['fullName'] =
          params.args['data']['profile']['create']['firstName'] +
          ' ' +
          (params.args['data']['profile']['create']['middleName']
            ? params.args['data']['profile']['create']['middleName'] + ' '
            : '') +
          params.args['data']['profile']['create']['lastName'];

        if (params.args['data']['profile']['create']['dateOfBirth']) {
          params.args['data']['profile']['create']['dateOfBirth'] = new Date(
            params.args['data']['profile']['create']['dateOfBirth'].toString()
          );
        }

        return next(params);
      case 'update':
        params.args['data']['profile']['update']['fullName'] =
          params.args['data']['profile']['update']['firstName'] +
          ' ' +
          (params.args['data']['profile']['update']['middleName']
            ? params.args['data']['profile']['update']['middleName'] + ' '
            : '') +
          params.args['data']['profile']['update']['lastName'];

        if (params.args['data']['profile']['create']['dateOfBirth']) {
          params.args['data']['profile']['create']['dateOfBirth'] = new Date(
            params.args['data']['profile']['create']['dateOfBirth'].toString()
          );
        }

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
        // Handle existed issue https://github.com/prisma/prisma/issues/17470
        if (params.action.toString() === 'findUniqueOrThrow') {
          const result = await next(params);
          if (result) {
            if (result.dateOfBirth) {
              result.dateOfBirth = result.dateOfBirth
                .toISOString()
                .split('T')[0];
            }
            if (result.intendedDateOfTravel) {
              result.intendedDateOfTravel = result.intendedDateOfTravel
                .toISOString()
                .split('T')[0];
            }
            if (result.dateOfExpiry) {
              result.dateOfExpiry = result.dateOfExpiry
                .toISOString()
                .split('T')[0];
            }
            if (result.dateOfIssue) {
              result.dateOfIssue = result.dateOfIssue
                .toISOString()
                .split('T')[0];
            }
            if (result.dateOfStatusCardIssue) {
              result.dateOfStatusCardIssue = result.dateOfStatusCardIssue
                .toISOString()
                .split('T')[0];
            }
            if (result.dateOfRequest) {
              result.dateOfRequest = result.dateOfRequest
                .toISOString()
                .split('T')[0];
            }
            return result;
          }
          return null;
        }

        return next(params);
    }
  }

  return next(params);
}
