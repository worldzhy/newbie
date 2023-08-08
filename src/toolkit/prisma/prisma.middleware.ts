import {BadRequestException} from '@nestjs/common';
import {Prisma} from '@prisma/client';
import {
  generateHash,
  generateRandomNumbers,
} from '@toolkit/utilities/common.util';
import {verifyEmail, verifyPassword} from '@toolkit/validators/user.validator';

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
  } else if (params.model === Prisma.ModelName.InfrastructureStack) {
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
  } else if (params.model === Prisma.ModelName.AvailabilityContainer) {
    switch (params.action) {
      case 'create':
      case 'update':
        const dateOfOpening = params.args['data']['dateOfOpening'];
        const dateOfClosure = params.args['data']['dateOfClosure'];
        if (dateOfOpening) {
          params.args['data']['dateOfOpening'] = new Date(dateOfOpening);
        }
        if (dateOfClosure) {
          params.args['data']['dateOfClosure'] = new Date(dateOfClosure);
        }
        return next(params);
      case 'findUnique':
      case 'findUniqueOrThrow':
      case 'findFirst':
      case 'findFirstOrThrow':
        const resultOne = await next(params);
        if (resultOne) {
          if (resultOne.dateOfOpening) {
            resultOne.dateOfOpening = new Date(resultOne.dateOfOpening)
              .toISOString()
              .split('T')[0];
          }
          if (resultOne.dateOfClosure) {
            resultOne.dateOfClosure = new Date(resultOne.dateOfClosure)
              .toISOString()
              .split('T')[0];
          }
        }
        return resultOne;
      case 'findMany':
        const resultMany = await next(params);
        if (resultMany) {
          for (let i = 0; i < resultMany.length; i++) {
            const element = resultMany[i];
            if (element.dateOfOpening) {
              element.dateOfOpening = new Date(element.dateOfOpening)
                .toISOString()
                .split('T')[0];
            }
            if (element.dateOfClosure) {
              element.dateOfClosure = new Date(element.dateOfClosure)
                .toISOString()
                .split('T')[0];
            }
          }
        }
        return resultMany;
      default:
        return next(params);
    }
  } else if (params.model === Prisma.ModelName.Availability) {
    switch (params.action) {
      case 'create':
      case 'update':
        const date = params.args['data']['date'];
        const timeOfStarting = params.args['data']['timeOfStarting'];
        const timeOfEnding = params.args['data']['timeOfEnding'];
        if (date) {
          params.args['data']['date'] = new Date(date);
        }
        if (timeOfStarting) {
          params.args['data']['timeOfStarting'] = new Date(
            date + 'T' + timeOfStarting
          );
        }
        if (timeOfEnding) {
          params.args['data']['timeOfEnding'] = new Date(
            date + 'T' + timeOfEnding
          );
        }
        return next(params);
      case 'createMany':
        for (let i = 0; i < params.args['data'].length; i++) {
          const availability = params.args['data'][i];

          const date = availability['date'];
          const timeOfStarting = availability['timeOfStarting'];
          const timeOfEnding = availability['timeOfEnding'];
          if (date) {
            params.args['data'][i]['date'] = new Date(date);
          }
          if (timeOfStarting) {
            params.args['data'][i]['timeOfStarting'] = new Date(
              date + 'T' + timeOfStarting
            );
          }
          if (timeOfEnding) {
            params.args['data'][i]['timeOfEnding'] = new Date(
              date + 'T' + timeOfEnding
            );
          }
        }
        return next(params);
      case 'findUnique':
      case 'findUniqueOrThrow':
      case 'findFirst':
      case 'findFirstOrThrow':
        const resultOne = await next(params);
        if (resultOne) {
          if (resultOne.date) {
            resultOne.date = new Date(resultOne.date)
              .toISOString()
              .split('T')[0];
          }
          if (resultOne.timeOfStarting) {
            resultOne.timeOfStarting = new Date(resultOne.timeOfStarting)
              .toISOString()
              .split('T')[1]
              .replace('.000Z', '');
          }
          if (resultOne.timeOfEnding) {
            resultOne.timeOfEnding = new Date(resultOne.timeOfEnding)
              .toISOString()
              .split('T')[1]
              .replace('.000Z', '');
          }
        }
        return resultOne;
      case 'findMany':
        const resultMany = await next(params);
        if (resultMany) {
          for (let i = 0; i < resultMany.length; i++) {
            const element = resultMany[i];
            if (element.date) {
              element.date = new Date(element.date).toISOString().split('T')[0];
            }
            if (element.timeOfStarting) {
              element.timeOfStarting = new Date(element.timeOfStarting)
                .toISOString()
                .split('T')[1]
                .replace('.000Z', '');
            }
            if (element.timeOfEnding) {
              element.timeOfEnding = new Date(element.timeOfEnding)
                .toISOString()
                .split('T')[1]
                .replace('.000Z', '');
            }
          }
        }
        return resultMany;
      default:
        return next(params);
    }
  }

  return next(params);
}
