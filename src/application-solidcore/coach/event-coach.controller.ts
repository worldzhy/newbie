import {Body, Controller, Post} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {Prisma} from '@prisma/client';
import {datePlusMinutes, splitDateTime} from '@toolkit/utilities/datetime.util';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {EventHostService} from '@microservices/event-scheduling/event-host.service';

const ROLE_NAME_COACH = 'Coach';

@ApiTags('Solidcore / Coach')
@ApiBearerAuth()
@Controller('event-coaches')
export class EventCoachController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly coachService: EventHostService
  ) {}

  @Post('')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Get coaches',
        value: {
          venueId: 1,
          typeId: 1,
          datetimeOfStart: '2023-11-28 17:40:05.025 +0800',
          timeZone: 'America/Los_Angeles',
        },
      },
    },
  })
  async getCoachesForEvent(
    @Body()
    body: {
      venueId: number;
      typeId?: number;
      datetimeOfStart?: Date;
      timeZone?: string;
    }
  ) {
    const {venueId, typeId, datetimeOfStart, timeZone} = body;
    // [step 1] There are enough conditions to get sorted coaches.
    if (venueId && typeId && datetimeOfStart && timeZone) {
      const dtOfStart = new Date(datetimeOfStart);
      const classType = await this.prisma.eventType.findUniqueOrThrow({
        where: {id: typeId},
        select: {minutesOfDuration: true},
      });
      const datetimeOfEnd = datePlusMinutes(
        dtOfStart,
        classType.minutesOfDuration
      );
      const splitedDateTime = splitDateTime(dtOfStart, timeZone);
      const event = {
        venueId,
        typeId,
        datetimeOfStart: dtOfStart,
        datetimeOfEnd,
        year: splitedDateTime.year,
        month: splitedDateTime.month,
        weekOfMonth: splitedDateTime.weekOfMonth,
        minutesOfDuration: classType.minutesOfDuration,
      };
      return await this.coachService.getSortedCoachesWithoutQuotaLimit(event);
    }

    // [step 2] There are not enough conditions to get sorted coaches.
    const where: Prisma.UserWhereInput = {};
    where.roles = {some: {name: ROLE_NAME_COACH}};
    if (venueId && typeId) {
      where.profile = {
        eventVenueIds: {has: venueId},
        eventTypeIds: {has: typeId},
      };
    } else if (venueId) {
      where.profile = {eventVenueIds: {has: venueId}};
    } else if (typeId) {
      where.profile = {eventTypeIds: {has: typeId}};
    }

    return await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        profile: {
          select: {
            fullName: true,
            eventVenueIds: true,
            eventTypeIds: true,
            eventHostTitle: true,
            quotaOfWeekMin: true,
            quotaOfWeekMax: true,
          },
        },
      },
    });
  }

  /* End */
}
