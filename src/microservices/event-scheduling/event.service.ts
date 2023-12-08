import {Injectable} from '@nestjs/common';
import {Prisma, Event} from '@prisma/client';
import {daysOfMonth} from '@toolkit/utilities/datetime.util';

@Injectable()
export class EventService {
  constructor() {}

  copyMany(params: {
    events: Event[];
    from: {
      year: number;
      month: number;
      week: number; // The number of week in a month, 1~6.
    };
    to: {
      year: number;
      month: number;
      week: number; // The number of week in a month, 1~6.
    };
  }) {
    const calendarOfSourceContainer = daysOfMonth(
      params.from.year,
      params.from.month
    );
    const calendarOfTargetContainer = daysOfMonth(
      params.to.year,
      params.to.month
    );
    const daysOfSourceWeek = calendarOfSourceContainer[params.from.week - 1];
    const daysOfTargetWeek = calendarOfTargetContainer[params.to.week - 1];
    const targetEvents: Prisma.EventCreateManyInput[] = [];

    for (let j = 0; j < daysOfTargetWeek.length; j++) {
      const dayOfTargetWeek = daysOfTargetWeek[j];

      for (let m = 0; m < daysOfSourceWeek.length; m++) {
        const dayOfSourceWeek = daysOfSourceWeek[m];
        if (dayOfSourceWeek.dayOfWeek === dayOfTargetWeek.dayOfWeek) {
          for (let n = 0; n < params.events.length; n++) {
            const event = params.events[n];
            if (
              dayOfSourceWeek.year === event.year &&
              dayOfSourceWeek.month === event.month &&
              dayOfSourceWeek.dayOfMonth === event.dayOfMonth &&
              dayOfSourceWeek.dayOfWeek === event.dayOfWeek
            ) {
              /*
               ! With `const datetimeOfStart = event.datetimeOfStart;`,
               ! when you set datetimeOfStart with new FullYear, Month and Date, 
               ! the original event.datetimeOfStart will be changed.
              */
              const datetimeOfStart = new Date(event.datetimeOfStart);
              datetimeOfStart.setFullYear(dayOfTargetWeek.year);
              datetimeOfStart.setMonth(dayOfTargetWeek.month - 1);
              datetimeOfStart.setDate(dayOfTargetWeek.dayOfMonth);

              targetEvents.push({
                hostUserId: event.hostUserId,
                datetimeOfStart: datetimeOfStart,
                timeZone: event.timeZone,
                minutesOfDuration: event.minutesOfDuration,
                typeId: event.typeId,
                venueId: event.venueId,
              } as Prisma.EventCreateManyInput);
            }
          }
        }
      }
    }

    return targetEvents;
  }
  /* End */
}
