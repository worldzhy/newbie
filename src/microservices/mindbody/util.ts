import * as _ from 'lodash';
import * as moment from 'moment';

export function toMbParams(query: any) {
  const {pageSize = 10, page = 1, locationId, startDate, endDate} = query;
  const offest = pageSize * (page - 1);
  const params = {
    limit: pageSize,
    offest,
    ...query,
  };

  if (locationId) {
    params['locationIds[0]'] = locationId;
    // params['locationIds[0]'] = 7;
    params['locationIds[0]'] = 1;
  }

  if (startDate) {
    params.startDate = startDate;
  }

  if (query.classScheduleIds) {
    params.classScheduleIds = query.classScheduleIds;
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
    _headers.SiteId = studioId;
    // _headers.SiteId = 552763;
    _headers.SiteId = -99;
  }
  return _headers;
}

export function hmsToSeconds(hms) {
  var splitTime = hms.split(':');
  var hours = parseInt(splitTime[0], 10) || 0;
  var minutes = parseInt(splitTime[1], 10) || 0;
  var seconds = parseInt(splitTime[2], 10) || 0;

  return hours * 3600 + minutes * 60 + seconds;
}

export function datetimeToDaySec(datetime) {
  const hms = moment(datetime).format('HH:mm:ss');
  var splitTime = hms.split(':');
  var hours = parseInt(splitTime[0], 10) || 0;
  var minutes = parseInt(splitTime[1], 10) || 0;
  var seconds = parseInt(splitTime[2], 10) || 0;

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

    const ResourceId = _.get(c,'Resource.Id') || 0

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

  _cs = _.sortBy(_cs, (d: any) => d.classdate);

  let groupCs = _.groupBy(_cs, (d: any) => {
    return d.classdate;
  });

  for (const dc of Object.keys(groupCs)) {
    groupCs[dc] = _.sortBy(groupCs[dc], (d: any) => d.startHour);
  }
  return groupCs;
}
