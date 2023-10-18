import {Controller, Get, Param} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {Event, AvailabilityTimeslotStatus} from '@prisma/client';
import {EventContainerService} from '@microservices/event-scheduling/event-container.service';
import {AvailabilityTimeslotService} from '@microservices/event-scheduling/availability-timeslot.service';
import {UserService} from '@microservices/account/user/user.service';

enum CheckEventResultType {
  Warning,
  Suggestion,
}
enum CheckEventResultMessage {
  Warning_CoachNotSelected = 'The coach has not been selected.',
  Warning_CoachNotExisted = 'The coach is not existed.',
  Warning_WrongClassType = 'The coach is not able to teach this type of class.',
  Warning_CoachNotAvailale = 'The coach is not available.',
}

@ApiTags('Event Container')
@ApiBearerAuth()
@Controller('event-containers')
export class EventCheckController {
  constructor(
    private readonly availabilityTimeslotService: AvailabilityTimeslotService,
    private readonly eventContainerService: EventContainerService,
    private readonly userService: UserService
  ) {}

  @Get(':eventContainerId/check')
  async checkEventContainer(
    @Param('eventContainerId') eventContainerId: number
  ) {
    const eventCheckResults: {
      eventId: number;
      checkResults: {type: CheckEventResultType; message: string}[];
    }[] = [];

    // Get event container.
    const container = await this.eventContainerService.findUniqueOrThrow({
      where: {id: eventContainerId},
      include: {events: true},
    });

    for (let i = 0; i < container['events'].length; i++) {
      const event = container['events'][i];
      const checkResults = await this.checkEvent(event);
      eventCheckResults.push({eventId: event.id, checkResults});
    }

    return eventCheckResults;
  }

  @Get(':eventContainerId/fix')
  async fixEventContainer(@Param('eventContainerId') eventContainerId: number) {
    // Get event container.
    const container = await this.eventContainerService.findUniqueOrThrow({
      where: {id: eventContainerId},
      include: {events: true},
    });

    for (let i = 0; i < container['events'].length; i++) {
      const event = container['events'][i];
      const checkResults = await this.checkEvent(event);
    }
  }

  async checkEvent(
    event: Event
  ): Promise<{type: CheckEventResultType; message: string}[]> {
    const checkResults: {type: CheckEventResultType; message: string}[] = [];

    // [step 1] Check coach id.
    if (!event.hostUserId) {
      checkResults.push({
        type: CheckEventResultType.Warning,
        message: CheckEventResultMessage.Warning_CoachNotSelected,
      });
      return checkResults;
    }

    // [step 2] Get the coach.
    const user = await this.userService.findUnique({
      where: {id: event.hostUserId},
      include: {profile: true},
    });
    if (!user) {
      checkResults.push({
        type: CheckEventResultType.Warning,
        message: CheckEventResultMessage.Warning_CoachNotExisted,
      });
      return checkResults;
    }

    // [step 3] Check class type.
    if (!user['profile']['eventTypeIds'].includes(event.typeId)) {
      checkResults.push({
        type: CheckEventResultType.Warning,
        message: CheckEventResultMessage.Warning_WrongClassType,
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
      checkResults.push({
        type: CheckEventResultType.Warning,
        message: CheckEventResultMessage.Warning_CoachNotAvailale,
      });
    }

    return checkResults;
  }

  /* End */
}
