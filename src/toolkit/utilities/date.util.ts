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

/**
 * Example: September, 2023
 * parseDaysOfMonth(2023, 9) =>
  [
    [ { dayOfMonth: 1, dayOfWeek: 5 }, { dayOfMonth: 2, dayOfWeek: 6 } ],
    [
      { dayOfMonth: 3, dayOfWeek: 0 },
      { dayOfMonth: 4, dayOfWeek: 1 },
      { dayOfMonth: 5, dayOfWeek: 2 },
      { dayOfMonth: 6, dayOfWeek: 3 },
      { dayOfMonth: 7, dayOfWeek: 4 },
      { dayOfMonth: 8, dayOfWeek: 5 },
      { dayOfMonth: 9, dayOfWeek: 6 }
    ],
    ...
  ]
 */
export function parseDaysOfMonth(year: number, month: number) {
  const numberOfDays = new Date(year, month, 0).getDate(); // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date#syntax

  const daysOfMonth: {dayOfMonth: number; dayOfWeek: number}[][] = [[]];
  for (let day = 1, week = 0; day <= numberOfDays; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfMonth = date.getDate();
    const dayOfWeek = date.getDay();

    if (dayOfWeek === 0 && day !== 1) {
      week += 1;
      daysOfMonth[week] = [];
    }

    daysOfMonth[week].push({
      dayOfMonth,
      dayOfWeek,
    });
  }
  return daysOfMonth;
}

export function getWeekNumber(year: number, month: number, day: number) {
  const startDate = new Date(year, 0, 1);
  const currentDate = new Date(year, month - 1, day);
  var days = Math.floor(
    (currentDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)
  );

  return Math.ceil(days / 7);
}
