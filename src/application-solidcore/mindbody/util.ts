/* eslint-disable @typescript-eslint/no-explicit-any */
import {datePlusMinutes, splitDateTime} from '@toolkit/utilities/datetime.util';
import * as _ from 'lodash';
import * as moment from 'moment';

export function hmsToSeconds(hms) {
  const splitTime = hms.split(':');
  const hours = parseInt(splitTime[0], 10) || 0;
  const minutes = parseInt(splitTime[1], 10) || 0;
  const seconds = parseInt(splitTime[2], 10) || 0;

  return hours * 3600 + minutes * 60 + seconds;
}

export function datetimeToDaySec(datetime) {
  const hms = moment(datetime).format('HH:mm:ss');
  const splitTime = hms.split(':');
  const hours = parseInt(splitTime[0], 10) || 0;
  const minutes = parseInt(splitTime[1], 10) || 0;
  const seconds = parseInt(splitTime[2], 10) || 0;

  return hours * 3600 + minutes * 60 + seconds;
}

export function groupClassesByDate(cs: any) {
  let _cs = cs.map((c: any) => {
    const weekday = moment(c.StartDateTime).weekday();
    const classdate = moment(c.StartDateTime).format('YYYY-MM-DD');

    const startTime = moment(c.StartDateTime).format('HH:mm:ss');
    const endTime = moment(c.EndDateTime).format('HH:mm:ss');

    const startSec = hmsToSeconds(startTime);
    const endSec = hmsToSeconds(endTime);

    const ResourceId = _.get(c, 'Resource.Id') || 0;

    return {
      ClassInstanceIds: c.Id,
      ClassScheduleId: c.ClassScheduleId,
      LocationId: c.Location.Id,
      name: c.ClassDescription.Name,
      ClassDescriptionActive: c.ClassDescription.Active,
      ClassDesId: c.ClassDescription.Id,
      weekday: weekday,
      startHour: moment(c.StartDateTime).hour(),
      ResourceId,
      startTime,
      endTime,
      classdate,
      startSec,
      endSec,
      email: c.Staff.Email,
      StaffId: c.Staff.Id,
    };
  });

  // if (resourceId) {
  //   _cs = _.filter(_cs, (d: any) => d.ResourceId === parseInt(resourceId));
  // }

  _cs = _.sortBy(_cs, (d: any) => d.classdate);

  const groupCs = _.groupBy(_cs, (d: any) => {
    return d.classdate;
  });

  for (const dc of Object.keys(groupCs)) {
    groupCs[dc] = _.sortBy(groupCs[dc], (d: any) => d.startHour);
  }
  return groupCs;
}

export function parseDess(resp) {
  const dess = _.get(resp, 'data.ClassDescriptions');
  return dess.filter(d => {
    d.Active === true;
  });
}

export function getWeekdays(dayOfWeek) {
  const weekdays = {
    DaySunday: false,
    DayMonday: false,
    DayTuesday: false,
    DayWednesday: false,
    DayThursday: false,
    DayFriday: false,
    DaySaturday: false,
  };

  switch (dayOfWeek) {
    case 0:
      weekdays.DaySunday = true;
      break;
    case 1:
      weekdays.DayMonday = true;
      break;
    case 2:
      weekdays.DayTuesday = true;
      break;
    case 3:
      weekdays.DayWednesday = true;
      break;
    case 4:
      weekdays.DayThursday = true;
      break;
    case 5:
      weekdays.DayFriday = true;
      break;
    case 6:
      weekdays.DaySaturday = true;
      break;
    default:
      break;
  }
  return weekdays;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function eventGeneratedFields(data: any) {
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
  return data;
}

export function compareObjects(obj1, obj2) {
  const diff = {};
  for (const key in obj1) {
    if (Object.prototype.hasOwnProperty.call(obj1, key)) {
      if (!Object.prototype.hasOwnProperty.call(obj2, key)) {
        diff[key] = obj1[key];
      } else {
        if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
          const nestedDiff = compareObjects(obj1[key], obj2[key]);
          if (Object.keys(nestedDiff).length > 0) {
            diff[key] = nestedDiff;
          }
        } else {
          if (obj1[key] !== obj2[key]) {
            diff[key] = obj1[key];
          }
        }
      }
    }
  }

  for (const key in obj2) {
    if (
      Object.prototype.hasOwnProperty.call(obj2, key) &&
      !Object.prototype.hasOwnProperty.call(obj1, key)
    ) {
      diff[key] = obj2[key];
    }
  }

  return diff;
}
