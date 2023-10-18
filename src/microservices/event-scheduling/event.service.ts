import {Injectable} from '@nestjs/common';
import {Prisma, Event} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {generateMonthlyCalendar} from '@toolkit/utilities/datetime.util';

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    args: Prisma.EventFindUniqueOrThrowArgs
  ): Promise<Event> {
    return await this.prisma.event.findUniqueOrThrow(args);
  }

  async findMany(args: Prisma.EventFindManyArgs): Promise<Event[]> {
    return await this.prisma.event.findMany(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.EventFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.Event,
      pagination,
      findManyArgs,
    });
  }

  async create(args: Prisma.EventCreateArgs): Promise<Event> {
    return await this.prisma.event.create(args);
  }

  async createMany(
    args: Prisma.EventCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.event.createMany(args);
  }

  async update(args: Prisma.EventUpdateArgs): Promise<Event> {
    return await this.prisma.event.update(args);
  }

  async updateMany(
    args: Prisma.EventUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.event.updateMany(args);
  }

  async delete(args: Prisma.EventDeleteArgs): Promise<Event> {
    return await this.prisma.event.delete(args);
  }

  async count(args: Prisma.EventCountArgs): Promise<number> {
    return await this.prisma.event.count(args);
  }

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
    const calendarOfSourceContainer = generateMonthlyCalendar(
      params.from.year,
      params.from.month
    );
    const calendarOfTargetContainer = generateMonthlyCalendar(
      params.to.year,
      params.to.month
    );
    const daysOfSourceWeek = calendarOfSourceContainer[params.from.week - 1];
    const daysOfTargetWeek = calendarOfTargetContainer[params.to.week - 1];
    const targetEvents: Prisma.EventUncheckedCreateWithoutContainerInput[] = [];

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
               * With `const datetimeOfStart = event.datetimeOfStart;`,
               ! when you set datetimeOfStart with new FullYear, Month and Date, 
               ! the original event.datetimeOfStart will be changed.
              */
              const datetimeOfStart = new Date(event.datetimeOfStart);
              datetimeOfStart.setFullYear(dayOfTargetWeek.year);
              datetimeOfStart.setMonth(dayOfTargetWeek.month - 1);
              datetimeOfStart.setDate(dayOfTargetWeek.dayOfMonth);

              const datetimeOfEnd = new Date(event.datetimeOfEnd);
              datetimeOfEnd.setFullYear(dayOfTargetWeek.year);
              datetimeOfEnd.setMonth(dayOfTargetWeek.month - 1);
              datetimeOfEnd.setDate(dayOfTargetWeek.dayOfMonth);

              targetEvents.push({
                hostUserId: event.hostUserId,
                year: dayOfTargetWeek.year,
                month: dayOfTargetWeek.month,
                week: dayOfTargetWeek.week,
                dayOfMonth: dayOfTargetWeek.dayOfMonth,
                dayOfWeek: dayOfTargetWeek.dayOfWeek,
                hour: event.hour,
                minute: event.minute,
                minutesOfDuration: event.minutesOfDuration,
                datetimeOfStart: datetimeOfStart,
                datetimeOfEnd: datetimeOfEnd,
                typeId: event.typeId,
                venueId: event.venueId,
              });
            }
          }
        }
      }
    }

    return targetEvents;
  }
  /* End */
}
