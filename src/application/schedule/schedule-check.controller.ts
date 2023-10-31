import {Controller, Get, Param} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {
  Event,
  AvailabilityTimeslotStatus,
  EventIssueType,
  EventIssueStatus,
  User,
} from '@prisma/client';
import {EventService} from '@microservices/event-scheduling/event.service';
import {EventIssueService} from '@microservices/event-scheduling/event-issue.service';
import {EventContainerService} from '@microservices/event-scheduling/event-container.service';
import {AvailabilityTimeslotService} from '@microservices/event-scheduling/availability-timeslot.service';
import {UserService} from '@microservices/account/user/user.service';

enum EventIssueDescription {
  Error_CoachNotSelected = 'The coach has not been selected.',
  Error_CoachNotExisted = 'The coach is not existed.',
  Error_CoachNotAvailale = 'The coach is not available.',
  Error_WrongClassType = 'The coach is not able to teach this type of class.',
  Error_WrongLocation = 'The coach is not able to teach in this location.',
}

@ApiTags('Event Container')
@ApiBearerAuth()
@Controller('event-containers')
export class EventCheckController {
  constructor(
    private readonly availabilityTimeslotService: AvailabilityTimeslotService,
    private readonly eventService: EventService,
    private readonly eventIssueService: EventIssueService,
    private readonly eventContainerService: EventContainerService,
    private readonly userService: UserService
  ) {}

  @Get(':eventContainerId/check')
  async checkEventContainer(
    @Param('eventContainerId') eventContainerId: number
  ) {
    // Get event container.
    const container = await this.eventContainerService.findUniqueOrThrow({
      where: {id: eventContainerId},
      include: {events: true},
    });

    // Check each issue.
    for (let i = 0; i < container['events'].length; i++) {
      const event = container['events'][i];
      await this.checkEventIssues(event);
    }

    return await this.eventIssueService.findMany({
      where: {
        status: EventIssueStatus.UNREPAIRED,
        event: {containerId: eventContainerId},
      },
    });
  }

  private async checkEventIssues(event: Event) {
    // [step 1] Check and get the coach.
    let coach: User | null = null;
    if (event.hostUserId) {
      coach = await this.userService.findUnique({
        where: {id: event.hostUserId},
        include: {profile: true},
      });
    }

    if (!coach) {
      await this.eventIssueService.upsert({
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
    if (!coach['profile']['eventTypeIds'].includes(event.typeId)) {
      await this.eventIssueService.upsert({
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
    if (!coach['profile']['eventVenueIds'].includes(event.venueId)) {
      await this.eventIssueService.upsert({
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
    const newDatetimeOfStart =
      this.availabilityTimeslotService.floorDatetimeOfStart(
        event.datetimeOfStart
      );
    const newDatetimeOfEnd = this.availabilityTimeslotService.ceilDatetimeOfEnd(
      event.datetimeOfEnd
    );

    const count = await this.availabilityTimeslotService.count({
      where: {
        hostUserId: coach.id,
        venueIds: {has: event.venueId},
        datetimeOfStart: {gte: newDatetimeOfStart},
        datetimeOfEnd: {lte: newDatetimeOfEnd},
        status: AvailabilityTimeslotStatus.USABLE,
      },
    });
    if (
      count <
      event.minutesOfDuration /
        this.availabilityTimeslotService.MINUTES_Of_TIMESLOT_UNIT
    ) {
      await this.eventIssueService.upsert({
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
