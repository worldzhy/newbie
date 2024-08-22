import {Prisma} from '@prisma/client';
import {
  datePlusMinutes,
  splitDateTime,
} from '@framework/utilities/datetime.util';

export async function eventPrismaMiddleware(
  params: Prisma.MiddlewareParams,
  next: (params: Prisma.MiddlewareParams) => Promise<any>
) {
  if (params.model === Prisma.ModelName.EventContainer) {
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
        eventGeneratedFields(params.args['data']);
        return next(params);
      }
      case 'createMany': {
        for (let i = 0; i < params.args['data'].length; i++) {
          eventGeneratedFields(params.args['data'][i]);
        }
        return next(params);
      }
      case 'delete': {
        params.action = 'update';
        params.args['data'] = {deletedAt: new Date()};
        return next(params);
      }
      case 'deleteMany': {
        params.action = 'updateMany';
        if (params.args.data != undefined) {
          params.args.data['deletedAt'] = new Date();
        } else {
          params.args['data'] = {deletedAt: new Date()};
        }
        return next(params);
      }
      default:
        return next(params);
    }
  }

  return next(params);
}

// 2023-08-10T12:00:00.000Z -> 2023-08-10
function formatOutputDate(date: Date) {
  return new Date(date).toISOString().split('T')[0];
}

function eventGeneratedFields(data: any) {
  if (data['datetimeOfStart'] && data['timeZone']) {
    data['datetimeOfStart'] = new Date(data['datetimeOfStart']);
    const splitedDateTime = splitDateTime(
      data['datetimeOfStart'],
      data['timeZone']
    );

    data['year'] = splitedDateTime.year;
    data['month'] = splitedDateTime.month;
    data['dayOfMonth'] = splitedDateTime.dayOfMonth;
    data['hour'] = splitedDateTime.hour;
    data['minute'] = splitedDateTime.minute;
    data['dayOfWeek'] = splitedDateTime.dayOfWeek;
    data['weekOfMonth'] = splitedDateTime.weekOfMonth;
    data['weekOfYear'] = splitedDateTime.weekOfYear;

    if (data['minutesOfDuration']) {
      data['datetimeOfEnd'] = datePlusMinutes(
        data['datetimeOfStart'],
        data['minutesOfDuration']
      );
    }
  }
}
