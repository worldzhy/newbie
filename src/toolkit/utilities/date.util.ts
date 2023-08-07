import * as moment from 'moment';

export function getSecondsUntilunixTimestamp(unixTimestamp: number): number {
  const unixNow = moment().unix();
  return unixTimestamp - unixNow;
}

export function convertUnixToDate(unixTimestamp: number): Date {
  return moment.unix(unixTimestamp).toDate();
}

export function currentPlusMinutes(minutes: number): Date {
  const currentTime = new Date();
  return new Date(currentTime.getTime() + minutes * 60000); // 1 min = 60000 ms
}

export function datePlusMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000); // 1 min = 60000 ms
}

export function datePlusYears(date: Date, years: number): Date {
  const year = date.getFullYear() + years;
  return new Date(date.setFullYear(year));
}

/**
 * Example: datePlusYearsForString('1990-01-01', 1) => '1991-01-01'
 */
export function datePlusYearsForString(dateStr: string, years: number): string {
  const date = new Date(dateStr);
  const year = date.getFullYear() + years;
  const newDate = new Date(date.setFullYear(year));
  return newDate.toISOString().split('T')[0];
}
