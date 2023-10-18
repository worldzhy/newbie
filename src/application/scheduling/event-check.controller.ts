import {Controller, Get, Param} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {
  Event,
  AvailabilityTimeslotStatus,
  EventIssueType,
  EventIssue,
} from '@prisma/client';
import {EventService} from '@microservices/event-scheduling/event.service';
import {EventIssueService} from '@microservices/event-scheduling/event-issue.service';
import {EventContainerService} from '@microservices/event-scheduling/event-container.service';
import {AvailabilityTimeslotService} from '@microservices/event-scheduling/availability-timeslot.service';
import {UserService} from '@microservices/account/user/user.service';

enum EventIssueDescription {
  Error_CoachNotSelected = 'The coach has not been selected.',
  Error_CoachNotExisted = 'The coach is not existed.',
  Error_WrongClassType = 'The coach is not able to teach this type of class.',
  Error_CoachNotAvailale = 'The coach is not available.',
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

    const events = await this.eventService.findMany({
      where: {containerId: eventContainerId},
      select: {
        id: true,
        issues: true,
      },
    });

    return events.filter(event => {
      return event['issues'].length > 0;
    });
  }

  async checkEventIssues(event: Event) {
    // [step 1] Check coach id.
    if (!event.hostUserId) {
      await this.eventIssueService.create({
        data: {
          type: EventIssueType.ERROR_COACH_NOT_EXISTED,
          description: EventIssueDescription.Error_CoachNotExisted,
          eventId: event.id,
        },
      });
      return;
    }

    // [step 2] Get the coach.
    const user = await this.userService.findUnique({
      where: {id: event.hostUserId},
      include: {profile: true},
    });
    if (!user) {
      await this.eventIssueService.create({
        data: {
          type: EventIssueType.ERROR_COACH_NOT_EXISTED,
          description: EventIssueDescription.Error_CoachNotExisted,
          eventId: event.id,
        },
      });
      return;
    }

    // [step 3] Check class type.
    if (!user['profile']['eventTypeIds'].includes(event.typeId)) {
      await this.eventIssueService.create({
        data: {
          type: EventIssueType.ERROR_COACH_NOT_AVAILABLE,
          description: EventIssueDescription.Error_WrongClassType,
          eventId: event.id,
        },
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
        hostUserId: event.hostUserId,
        datetimeOfStart: {gte: newDatetimeOfStart},
        datetimeOfEnd: {lte: newDatetimeOfEnd},
        status: AvailabilityTimeslotStatus.USABLE,
      },
    });
    if (
      count <
      event.minutesOfDuration /
        this.availabilityTimeslotService.MINUTES_Of_TIMESLOT
    ) {
      await this.eventIssueService.create({
        data: {
          type: EventIssueType.ERROR_COACH_NOT_AVAILABLE,
          description: EventIssueDescription.Error_CoachNotAvailale,
          eventId: event.id,
        },
      });
    }
  }

  /* End */
}
