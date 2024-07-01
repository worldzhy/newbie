import {Controller, Post, Body, BadRequestException} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {NoGuard} from '@microservices/account/security/passport/public/public.decorator';
import {
  constructDateTime,
  datePlusMinutes,
  sameWeekdaysOfMonth,
} from '@toolkit/utilities/datetime.util';
import * as moment from 'moment';
import {
  Prisma,
  Event,
  EventChangeLogType,
  EventIssueStatus,
} from '@prisma/client';
import {EventIssueService} from '@microservices/event-scheduling/event-issue.service';
import {RoleService} from '@microservices/account/role/role.service';

@ApiTags('Solution')
@ApiBearerAuth()
@Controller('solution')
export class SolutionSchedulingController {
  constructor(
    private readonly eventIssueService: EventIssueService,
    private readonly prisma: PrismaService
  ) {}

  /** copy from event.controller */
  async createEvent(
    @Body()
    body: Prisma.EventUncheckedCreateInput & {needToDuplicate?: boolean}
  ): Promise<Event> {
    if (!body.hostUserId) {
      throw new BadRequestException('hostUserId is required.');
    }

    // [step 1] Create event.
    const eventType = await this.prisma.eventType.findUniqueOrThrow({
      where: {id: body.typeId},
    });
    body.minutesOfDuration = eventType.minutesOfDuration;

    const {needToDuplicate} = body;

    delete body.needToDuplicate;
    const event = await this.prisma.event.create({
      data: body,
      include: {type: true},
    });

    // [step 2] Note add event.
    await this.prisma.eventChangeLog.create({
      data: {
        type: EventChangeLogType.USER,
        description:
          'New class: ' + eventType.name + ' at ' + body.datetimeOfStart,
        eventContainerId: body.containerId,
        eventId: event.id,
      },
    });

    // [step 3] Check event issues.
    await this.eventIssueService.check(event);

    // [step 4] Attach information.
    event['issues'] = await this.prisma.eventIssue.findMany({
      where: {status: EventIssueStatus.UNREPAIRED, eventId: event.id},
    });
    event['hostUser'] = await this.prisma.userSingleProfile.findUniqueOrThrow({
      where: {userId: body.hostUserId},
      select: {userId: true, fullName: true, eventHostTitle: true},
    });

    // [step 5] Duplicate events.
    if (needToDuplicate) {
      const sameWeekdays = sameWeekdaysOfMonth(
        event.year,
        event.month,
        event.dayOfMonth
      );
      for (let i = 0; i < sameWeekdays.length; i++) {
        const sameWeekDay = sameWeekdays[i];
        if (sameWeekDay.dayOfMonth === event.dayOfMonth) {
          continue;
        }

        const newDatetimeOfStart = constructDateTime(
          sameWeekDay.year,
          sameWeekDay.month,
          sameWeekDay.dayOfMonth,
          event.hour,
          event.minute,
          0,
          event.timeZone
        );
        const newDatetimeOfEnd = datePlusMinutes(
          newDatetimeOfStart,
          eventType.minutesOfDuration
        );

        // Check if there is another event around this period.
        if (
          (await this.prisma.event.count({
            where: {
              containerId: body.containerId,
              datetimeOfStart: {lt: newDatetimeOfEnd},
              datetimeOfEnd: {gt: newDatetimeOfStart},
            },
          })) > 0
        ) {
          continue;
        }

        const newOtherEvent = await this.prisma.event.create({
          data: {
            hostUserId: event.hostUserId,
            datetimeOfStart: newDatetimeOfStart,
            minutesOfDuration: event.minutesOfDuration,
            timeZone: event.timeZone,
            typeId: event.typeId,
            venueId: event.venueId,
            containerId: event.containerId,
          } as Prisma.EventUncheckedCreateInput,
        });

        // Note the update.
        await this.prisma.eventChangeLog.create({
          data: {
            type: EventChangeLogType.USER,
            description:
              'New class: ' +
              eventType.name +
              ' at ' +
              newOtherEvent.datetimeOfStart,
            eventContainerId: newOtherEvent.containerId,
            eventId: newOtherEvent.id,
          },
        });
      }
    }

    return event;
  }

  @Post('init-schedule-example')
  @NoGuard()
  async initExample() {
    const user = await this.prisma.user.findFirst({
      where: {roles: {some: {name: RoleService.RoleName.EVENT_HOST}}},
      select: {
        id: true,
      },
    });
    if (!user) {
      throw new BadRequestException('Not found Host.');
    }
    const eventType = await this.prisma.eventType.findFirst();
    if (!eventType) {
      throw new BadRequestException('Not found EventType.');
    }

    const eventVenue = await this.prisma.eventVenue.findFirst();
    if (!eventVenue) {
      throw new BadRequestException('Not found EventVenue.');
    }

    await this.prisma.eventContainer.deleteMany({
      where: {
        name: {startsWith: 'Example'},
      },
    });

    const currentDate = moment();
    const year = currentDate.year();
    const month = currentDate.month() + 1;
    const eventContainer = await this.prisma.eventContainer.create({
      data: {
        name: `Example ${year}-${month}`,
        year: year,
        month: month,
        venueId: eventVenue.id,
      },
    });
    const common = {
      year: year,
      month: month,
      typeId: eventType.id,
      venueId: eventVenue.id,
      hostUserId: user.id,
      containerId: eventContainer.id,
      needToDuplicate: true,
      timeZone: 'America/Los_Angeles',
    };
    const datetimeOfStarts = [
      `${currentDate.format('YYYY-MM')}-03T05:15:00-07:00`,
      `${currentDate.format('YYYY-MM')}-04T06:15:00-07:00`,
      `${currentDate.format('YYYY-MM')}-01T05:45:00-07:00`,
      `${currentDate.format('YYYY-MM')}-05T14:15:00-07:00`,
      `${currentDate.format('YYYY-MM')}-07T08:15:00-07:00`,
      `${currentDate.format('YYYY-MM')}-09T10:30:00-07:00`,
      `${currentDate.format('YYYY-MM')}-08T10:30:00-07:00`,
      `${currentDate.format('YYYY-MM')}-10T11:45:00-07:00`,
      `${currentDate.format('YYYY-MM')}-13T14:15:00-07:00`,
      `${currentDate.format('YYYY-MM')}-13T05:15:00-07:00`,
      `${currentDate.format('YYYY-MM')}-14T15:45:00-07:00`,
      `${currentDate.format('YYYY-MM')}-16T16:45:00-07:00`,
      `${currentDate.format('YYYY-MM')}-19T08:15:00-07:00`,
      `${currentDate.format('YYYY-MM')}-21T14:30:00-07:00`,
      `${currentDate.format('YYYY-MM')}-22T09:45:00-07:00`,
      `${currentDate.format('YYYY-MM')}-23T18:15:00-07:00`,
      `${currentDate.format('YYYY-MM')}-24T17:30:00-07:00`,
    ];
    for (const d of datetimeOfStarts) {
      await this.createEvent({...common, datetimeOfStart: d} as any);
    }
    return 'ok';
  }
}
