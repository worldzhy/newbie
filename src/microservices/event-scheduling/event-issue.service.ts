import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {
  Prisma,
  EventIssue,
  EventIssueType,
  Event,
  User,
  AvailabilityTimeslotStatus,
} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {ceilByMinutes, floorByMinutes} from '@toolkit/utilities/datetime.util';

enum EventIssueDescription {
  Error_CoachNotSelected = 'The coach has not been selected.',
  Error_CoachNotExisted = 'The coach is not existed.',
  Error_CoachNotAvailale = 'The coach is not available.',
  Error_WrongClassType = 'The coach is not able to teach this type of class.',
  Error_WrongLocation = 'The coach is not able to teach in this location.',
}

@Injectable()
export class EventIssueService {
  private MINUTES_Of_TIMESLOT_UNIT: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {
    this.MINUTES_Of_TIMESLOT_UNIT = this.configService.getOrThrow<number>(
      'microservice.eventScheduling.minutesOfTimeslotUnit'
    );
  }

  async findUniqueOrThrow(
    args: Prisma.EventIssueFindUniqueOrThrowArgs
  ): Promise<EventIssue> {
    return await this.prisma.eventIssue.findUniqueOrThrow(args);
  }

  async findMany(args: Prisma.EventIssueFindManyArgs): Promise<EventIssue[]> {
    return await this.prisma.eventIssue.findMany(args);
  }

  async findManyInOnePage(findManyArgs?: Prisma.EventIssueFindManyArgs) {
    return await this.prisma.findManyInOnePage({
      model: Prisma.ModelName.EventIssue,
      findManyArgs,
    });
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.EventIssueFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.EventIssue,
      pagination,
      findManyArgs,
    });
  }

  async create(args: Prisma.EventIssueCreateArgs): Promise<EventIssue> {
    return await this.prisma.eventIssue.create(args);
  }

  async createMany(
    args: Prisma.EventIssueCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.eventIssue.createMany(args);
  }

  async update(args: Prisma.EventIssueUpdateArgs): Promise<EventIssue> {
    return await this.prisma.eventIssue.update(args);
  }

  async updateMany(
    args: Prisma.EventIssueUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.eventIssue.updateMany(args);
  }

  async upsert(args: Prisma.EventIssueUpsertArgs): Promise<EventIssue> {
    return await this.prisma.eventIssue.upsert(args);
  }

  async delete(args: Prisma.EventIssueDeleteArgs): Promise<EventIssue> {
    return await this.prisma.eventIssue.delete(args);
  }

  async checkEvent(event: Event) {
    // [step 1] Check and get the coach.
    let hostUser: User | null = null;
    if (event.hostUserId) {
      hostUser = await this.prisma.user.findUnique({
        where: {id: event.hostUserId},
        include: {profile: true},
      });
    }

    if (!hostUser) {
      await this.prisma.eventIssue.upsert({
        where: {
          type_eventId: {
            eventId: event.id,
            type: EventIssueType.ERROR_COACH_NOT_EXISTED,
          },
        },
        create: {
          type: EventIssueType.ERROR_COACH_NOT_EXISTED,
          description: EventIssueDescription.Error_CoachNotExisted,
          eventId: event.id,
        },
        update: {},
      });
      return;
    }

    // [step 2] Check class type.
    if (!hostUser['profile']['eventTypeIds'].includes(event.typeId)) {
      await this.prisma.eventIssue.upsert({
        where: {
          type_eventId: {
            eventId: event.id,
            type: EventIssueType.ERROR_COACH_NOT_AVAILABLE_FOR_EVENT_TYPE,
          },
        },
        create: {
          type: EventIssueType.ERROR_COACH_NOT_AVAILABLE_FOR_EVENT_TYPE,
          description: EventIssueDescription.Error_WrongClassType,
          eventId: event.id,
        },
        update: {},
      });
    }

    // [step 3] Check location.
    if (!hostUser['profile']['eventVenueIds'].includes(event.venueId)) {
      await this.prisma.eventIssue.upsert({
        where: {
          type_eventId: {
            eventId: event.id,
            type: EventIssueType.ERROR_COACH_NOT_AVAILABLE_FOR_EVENT_VENUE,
          },
        },
        create: {
          type: EventIssueType.ERROR_COACH_NOT_AVAILABLE_FOR_EVENT_VENUE,
          description: EventIssueDescription.Error_WrongLocation,
          eventId: event.id,
        },
        update: {},
      });
    }

    // [step 4] Check availability
    const newDatetimeOfStart = floorByMinutes(
      event.datetimeOfStart,
      this.MINUTES_Of_TIMESLOT_UNIT
    );
    const newDatetimeOfEnd = ceilByMinutes(
      event.datetimeOfEnd,
      this.MINUTES_Of_TIMESLOT_UNIT
    );

    const count = await this.prisma.availabilityTimeslot.count({
      where: {
        hostUserId: hostUser.id,
        venueIds: {has: event.venueId},
        datetimeOfStart: {gte: newDatetimeOfStart},
        datetimeOfEnd: {lte: newDatetimeOfEnd},
        status: AvailabilityTimeslotStatus.USABLE,
      },
    });
    if (count < event.minutesOfDuration / this.MINUTES_Of_TIMESLOT_UNIT) {
      await this.prisma.eventIssue.upsert({
        where: {
          type_eventId: {
            eventId: event.id,
            type: EventIssueType.ERROR_COACH_NOT_AVAILABLE_FOR_EVENT_TIME,
          },
        },
        create: {
          type: EventIssueType.ERROR_COACH_NOT_AVAILABLE_FOR_EVENT_TIME,
          description: EventIssueDescription.Error_CoachNotAvailale,
          eventId: event.id,
        },
        update: {},
      });
    }
  }

  /* End */
}
