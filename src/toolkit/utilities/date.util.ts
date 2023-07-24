import * as moment from 'moment';

export const getSecondsUntilunixTimestamp = (unixTimestamp: number) => {
  const unixNow = moment().unix();
  return unixTimestamp - unixNow;
};

export const convertUnixToDate = (unixTimestamp: number) => {
  return moment.unix(unixTimestamp).toDate();
};
