import * as moment from 'moment';

// !>>> Unix date
export function getSecondsUntilunixTimestamp(unixTimestamp: number): number {
  const unixNow = moment().unix();
  return unixTimestamp - unixNow;
}

export function convertUnixToDate(unixTimestamp: number): Date {
  return moment.unix(unixTimestamp).toDate();
}

// !>>> Calculate date
export function currentPlusMinutes(minutes: number): Date {
  const currentTime = new Date();
  return new Date(currentTime.getTime() + minutes * 60000); // 1 min = 60000 ms
}

export function datePlusMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000); // 1 min = 60000 ms
}

export function dateMinusMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() - minutes * 60000); // 1 min = 60000 ms
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

// !>>> Get date
export function dayOfWeek(year: number, month: number, day: number) {
  const date = new Date(year, month - 1, day);
  return date.getDay();
}

export function firstDayOfMonth(year: number, month: number) {
  return new Date(year, month - 1, 1);
}

export function lastDayOfMonth(year: number, month: number) {
  return new Date(year, month, 0);
}

export function currentQuarter(): number {
  return moment().quarter();
}

export function firstDayOfQuarter(year: number, quarter: number) {
  let month = 0;
  if (quarter === 1) {
    month = 1;
  } else if (quarter === 2) {
    month = 4;
  } else if (quarter === 3) {
    month = 7;
  } else if (quarter === 4) {
    month = 10;
  }
  return new Date(year, month - 1, 1);
}

export function quarterOfMonth(month: number): number {
  if (month === 1 || month === 2 || month === 3) {
    return 1;
  } else if (month === 4 || month === 5 || month === 6) {
    return 2;
  } else if (month === 7 || month === 8 || month === 9) {
    return 3;
  } else if (month === 10 || month === 11 || month === 12) {
    return 4;
  } else {
    return -1;
  }
}

/**
 * Get the number of week for a specific day in a month. It will return 1 to 6.
 */
export function weekOfMonth(year: number, month: number, day: number) {
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay();
  const dayOfMonth = date.getDate();
  return Math.ceil((dayOfMonth + (dayOfWeek === 0 ? 0 : 6 - dayOfWeek)) / 7);
}

/**
 * Get the number of week for a specific day in a year. It will return 1 to 53.
 */
export function weekOfYear(year: number, month: number, day: number) {
  const date = new Date(year, month - 1, day);
  return parseInt(moment(date).format('W'));
}

export function floorByMinutes(datetimeOfStart: Date, minutes: number) {
  return dateMinusMinutes(
    datetimeOfStart,
    datetimeOfStart.getMinutes() % minutes
  );
}

export function ceilByMinutes(datetimeOfEnd: Date, minutes: number) {
  if (datetimeOfEnd.getMinutes() % minutes === 0) {
    return datetimeOfEnd;
  } else {
    return datePlusMinutes(
      datetimeOfEnd,
      minutes - (datetimeOfEnd.getMinutes() % minutes)
    );
  }
}

export function constructDateTime(
  year: number,
  month: number,
  dayOfMonth: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string | number
) {
  let offset: string = '';
  if (typeof timeZone === 'number') {
    offset = timeZone.toString();
  } else {
    const tmpDate = new Date(year, month - 1, dayOfMonth, hour, minute);
    offset = getTimeZoneOffset(tmpDate, timeZone);
    const tmpDate2 = new Date(
      year +
        '-' +
        month +
        '-' +
        dayOfMonth +
        ' ' +
        hour +
        ':' +
        minute +
        ':' +
        second +
        offset
    );
    offset = getTimeZoneOffset(tmpDate2, timeZone);
  }

  return new Date(
    year +
      '-' +
      month +
      '-' +
      dayOfMonth +
      ' ' +
      hour +
      ':' +
      minute +
      ':' +
      second +
      offset
  );
}

/**
 * @param date
 * @param timeZone The runtime's time zone is default time zone if 'timeZone' is undefined.
 */
export function splitDateTime(
  date: Date = new Date(),
  timeZone?: string // https://data.iana.org/time-zones/tz-link.html
) {
  // The format is '29/09/2019, 05:55:55'
  const formatter = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'short',
    timeStyle: 'medium',
    timeZone: timeZone,
  });
  const arrayDateTime = formatter.format(date).split(', ');
  const arrayDate = arrayDateTime[0].split('/');
  const arrayTime = arrayDateTime[1].split(':');

  const year = parseInt(arrayDate[2]);
  const month = parseInt(arrayDate[1]);
  const dayOfMonth = parseInt(arrayDate[0]);
  const hour = parseInt(arrayTime[0]);
  const minute = parseInt(arrayTime[1]);
  return {
    year,
    month,
    dayOfMonth,
    hour,
    minute,
    dayOfWeek: dayOfWeek(year, month, dayOfMonth),
    weekOfMonth: weekOfMonth(year, month, dayOfMonth),
    weekOfYear: weekOfYear(year, month, dayOfMonth),
  };
}

/**
 * The format is '09:31:07 GMT-5'.
 * The offset is related to the date even for the same time zone.
 * @param timeZone example: 'America/Los_Angeles'
 * @returns string of number, like '-5'
 */
export function getTimeZoneOffset(date: Date = new Date(), timeZone?: string) {
  return new Intl.DateTimeFormat('en-GB', {
    timeStyle: 'long',
    timeZone: timeZone,
  })
    .format(date)
    .split('GMT')[1];
}

/**
 * Example: September, 2023
 * generateMonthlyCalendar(2023, 9) =>
  [
    [ { year: 2023, month: 9, dayOfMonth: 1, dayOfWeek: 5 },
      { year: 2023, month: 9, dayOfMonth: 2, dayOfWeek: 6 }
    ],
    [
      { year: 2023, month: 9, dayOfMonth: 3, dayOfWeek: 0 },
      { year: 2023, month: 9, dayOfMonth: 4, dayOfWeek: 1 },
      { year: 2023, month: 9, dayOfMonth: 5, dayOfWeek: 2 },
      { year: 2023, month: 9, dayOfMonth: 6, dayOfWeek: 3 },
      { year: 2023, month: 9, dayOfMonth: 7, dayOfWeek: 4 },
      { year: 2023, month: 9, dayOfMonth: 8, dayOfWeek: 5 },
      { year: 2023, month: 9, dayOfMonth: 9, dayOfWeek: 6 }
    ],
    ...
  ]
 */
export function daysOfMonth(
  year: number,
  month: number,
  selectedWeek?: number
) {
  const numberOfDays = new Date(year, month, 0).getDate(); // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date#syntax

  const daysOfMonth: {
    year: number;
    month: number;
    dayOfMonth: number;
    dayOfWeek: number;
    weekOfMonth: number;
    weekOfYear: number;
  }[][] = [[]];
  for (let day = 1, week = 1; day <= numberOfDays; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfMonth = date.getDate();
    const dayOfWeek = date.getDay();

    // * Monday is the first day => if (dayOfWeek === 1 && day !== 1)
    // * Sunday is the first day => if (dayOfWeek === 0 && day !== 1)
    if (dayOfWeek === 1 && day !== 1) {
      week += 1;
      daysOfMonth[week - 1] = [];
    }

    if (selectedWeek) {
      if (week !== selectedWeek) {
        continue;
      }
    }

    daysOfMonth[week - 1].push({
      year,
      month,
      dayOfMonth,
      dayOfWeek,
      weekOfMonth: week,
      weekOfYear: weekOfYear(year, month, dayOfMonth),
    });
  }
  return daysOfMonth;
}

export function daysOfWeek(
  year: number,
  month: number,
  weekOfMonth: number // 1~6
) {
  const numberOfDays = new Date(year, month, 0).getDate(); // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date#syntax

  const daysOfWeek: {
    year: number;
    month: number;
    dayOfMonth: number;
    dayOfWeek: number;
    weekOfMonth: number;
    weekOfYear: number;
  }[] = [];
  for (let day = 1, week = 1; day <= numberOfDays; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfMonth = date.getDate();
    const dayOfWeek = date.getDay();

    // * Monday is the first day => if (dayOfWeek === 1 && day !== 1)
    // * Sunday is the first day => if (dayOfWeek === 0 && day !== 1)
    if (dayOfWeek === 1 && day !== 1) {
      week += 1;
    }
    if (week === weekOfMonth) {
      daysOfWeek.push({
        year,
        month,
        dayOfMonth,
        dayOfWeek,
        weekOfMonth: week,
        weekOfYear: weekOfYear(year, month, dayOfMonth),
      });
    }
  }
  return daysOfWeek;
}

export function sameWeekdaysOfMonth(
  year: number,
  month: number,
  dayOfMonth: number
) {
  const numberOfDays = new Date(year, month, 0).getDate(); // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date#syntax
  const specificDayOfWeek = new Date(year, month - 1, dayOfMonth).getDay();

  const sameWeekdaysOfMonth: {
    year: number;
    month: number;
    dayOfMonth: number;
    dayOfWeek: number;
    weekOfMonth: number;
    weekOfYear: number;
  }[] = [];
  for (let day = 1, week = 1; day <= numberOfDays; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfMonth = date.getDate();
    const dayOfWeek = date.getDay();

    // * Monday is the first day => if (dayOfWeek === 1 && day !== 1)
    // * Sunday is the first day => if (dayOfWeek === 0 && day !== 1)
    if (dayOfWeek === 1 && day !== 1) {
      week += 1;
    }
    if (dayOfWeek === specificDayOfWeek) {
      sameWeekdaysOfMonth.push({
        year,
        month,
        dayOfMonth,
        dayOfWeek,
        weekOfMonth: week,
        weekOfYear: weekOfYear(year, month, dayOfMonth),
      });
    }
  }
  return sameWeekdaysOfMonth;
}
