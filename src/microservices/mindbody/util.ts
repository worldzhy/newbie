/* eslint-disable @typescript-eslint/no-explicit-any */
import * as _ from 'lodash';
import * as moment from 'moment';

export function toMbParams(query: any) {
  const {
    pageSize = 10,
    page = 1,
    locationId,
    startDate,
    endDate,
    locationIds,
  } = query;
  const offest = pageSize * (page - 1);
  const params = {
    limit: pageSize,
    offest,
    ...query,
  };

  if (locationId) {
    params.locationId = 3;
  }

  if (locationIds) {
    params.locationIds = 3;
  }

  params.scheduleTypes = 'Resource';

  if (startDate) {
    params.startDate = startDate;
  }

  if (query.classScheduleIds) {
    params.classScheduleIds = query.classScheduleIds;
  }

  if (endDate) {
    params.endDate = endDate;
  }

  if (endDate) {
    params.endDate = endDate;
  }
  return params;
}

export function parseHeaders(headers: any, query: any) {
  const {studioId} = query;
  const _headers = _.cloneDeep(headers);
  if (studioId) {
    _headers.SiteId = 44717;
  }
  return _headers;
}

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

export function groupClassesByDate(cs: any, resourceId: any = undefined) {
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
    };
  });

  console.log(resourceId);
  if (resourceId) {
    _cs = _.filter(_cs, (d: any) => d.ResourceId === parseInt(resourceId));
  }

  _cs = _.sortBy(_cs, (d: any) => d.classdate);

  const groupCs = _.groupBy(_cs, (d: any) => {
    return d.classdate;
  });

  for (const dc of Object.keys(groupCs)) {
    groupCs[dc] = _.sortBy(groupCs[dc], (d: any) => d.startHour);
  }
  return groupCs;
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
