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
  } else if (params.model === Prisma.ModelName.EventContainer) {
    switch (params.action) {
      case 'create':
      case 'update': {
        const dateOfOpening = params.args['data']['dateOfOpening'];
        const dateOfClosure = params.args['data']['dateOfClosure'];
        if (dateOfOpening) {
          params.args['data']['dateOfOpening'] = new Date(dateOfOpening);
        }
        if (dateOfClosure) {
          params.args['data']['dateOfClosure'] = new Date(dateOfClosure);
        }
        return next(params);
      }
      case 'findUnique':
      case 'findUniqueOrThrow':
      case 'findFirst':
      case 'findFirstOrThrow': {
        const resultOne = await next(params);
        if (resultOne) {
          if (resultOne.dateOfOpening) {
            resultOne.dateOfOpening = formatOutputDate(resultOne.dateOfOpening);
          }
          if (resultOne.dateOfClosure) {
            resultOne.dateOfClosure = formatOutputDate(resultOne.dateOfClosure);
          }
        }
        return resultOne;
      }
      case 'findMany': {
        const resultMany = await next(params);
        if (resultMany) {
          for (let i = 0; i < resultMany.length; i++) {
            const element = resultMany[i];
            if (element.dateOfOpening) {
              element.dateOfOpening = formatOutputDate(element.dateOfOpening);
            }
            if (element.dateOfClosure) {
              element.dateOfClosure = formatOutputDate(element.dateOfClosure);
            }
          }
        }
        return resultMany;
      }
      default:
        return next(params);
    }
  } else if (params.model === Prisma.ModelName.Event) {
    switch (params.action) {
      case 'create':
      case 'update': {
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
      }
      case 'createMany': {
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
      }
      case 'findUnique':
      case 'findUniqueOrThrow':
      case 'findFirst':
      case 'findFirstOrThrow': {
        const resultOne = await next(params);
        if (resultOne) {
          if (resultOne.date) {
            resultOne.date = formatOutputDate(resultOne.date);
          }
          if (resultOne.timeOfStarting) {
            resultOne.timeOfStarting = formatOutputTime(
              resultOne.timeOfStarting
            );
          }
          if (resultOne.timeOfEnding) {
            resultOne.timeOfEnding = formatOutputTime(resultOne.timeOfEnding);
          }
        }
        return resultOne;
      }
      case 'findMany': {
        const resultMany = await next(params);
        if (resultMany) {
          for (let i = 0; i < resultMany.length; i++) {
            const element = resultMany[i];
            if (element.date) {
              element.date = formatOutputDate(element.date);
            }
            if (element.timeOfStarting) {
              element.timeOfStarting = formatOutputTime(element.timeOfStarting);
            }
            if (element.timeOfEnding) {
              element.timeOfEnding = formatOutputTime(element.timeOfEnding);
            }
          }
        }
        return resultMany;
      }
      default:
        return next(params);
    }
  }

  return next(params);
}

// 2023-08-10 -> 2023-08-10T12:00:00.000Z
function formatInputDate() {}

// 12:00:00 -> 2023-08-10T12:00:00.000Z
function formatInputTime() {}

// 2023-08-10T12:00:00.000Z -> 2023-08-10
function formatOutputDate(date: Date) {
  return new Date(date).toISOString().split('T')[0];
}

// 2023-08-10T12:00:00.000Z -> 12:00:00
function formatOutputTime(date: Date) {
  return new Date(date).toISOString().split('T')[1].replace('.000Z', '');
}
