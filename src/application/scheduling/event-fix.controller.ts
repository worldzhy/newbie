import {Controller, Post, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {Event, AvailabilityTimeslotStatus, Prisma} from '@prisma/client';
import {AvailabilityTimeslotService} from '@microservices/event-scheduling/availability-timeslot.service';
import {UserService} from '@microservices/account/user/user.service';
import {EventService} from '@microservices/event-scheduling/event.service';

const ROLE_NAME_COACH = 'Coach';

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
  private MINUTES_Of_TIMESLOT: number;
  constructor(
    private readonly availabilityTimeslotService: AvailabilityTimeslotService,
    private readonly eventService: EventService,
    private readonly userService: UserService
  ) {
    this.MINUTES_Of_TIMESLOT =
      this.availabilityTimeslotService.MINUTES_Of_TIMESLOT;
  }

  @Post(':eventContainerId/fix')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {eventIds: [1, 4, 12]},
      },
    },
  })
  async fixEventContainer(@Body() body: {eventIds: number[]}) {
    // Get events.
    const events = await this.eventService.findMany({
      where: {id: {in: body.eventIds}},
    });

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      await this.fixEvent(event);
    }
  }

  async fixEvent(event: Event) {
    // [step 2] Get coaches for the specific venue and type.
    const coaches = await this.userService.findMany({
      where: {
        roles: {some: {name: ROLE_NAME_COACH}},
        profile: {
          eventVenueIds: {has: event.venueId},
          eventTypeIds: {has: event.typeId},
        },
      },
      include: {profile: true},
    });
    const coachIds = coaches.map(coach => {
      return coach.id;
    });

    // [step 3] Filter coaches.
    const filteredCoachIds: string[] = [];

    // [step 3-1] Get availabilities.
    const newDatetimeOfStart =
      this.availabilityTimeslotService.floorDatetimeOfStart(
        event.datetimeOfStart
      );
    const newDatetimeOfEnd = this.availabilityTimeslotService.ceilDatetimeOfEnd(
      event.datetimeOfEnd
    );

    const availabilities = await this.availabilityTimeslotService.findMany({
      where: {
        hostUserId: {in: coachIds},
        datetimeOfStart: {gte: newDatetimeOfStart},
        datetimeOfEnd: {lte: newDatetimeOfEnd},
        status: AvailabilityTimeslotStatus.USABLE,
      },
    });

    // [step 3-2] Filter coaches.
    for (let i = 0; i < coachIds.length; i++) {
      const coachId = coachIds[i];
      const tmpAvailabilities = availabilities.filter(availability => {
        return availability.hostUserId === coachId;
      });
      if (
        tmpAvailabilities.length >=
        event.minutesOfDuration / this.MINUTES_Of_TIMESLOT
      ) {
        filteredCoachIds.push(coachId);
      }
    }

    // [step 4] Return users without password.
    const finalCoaches: object[] = [];
    coaches.forEach(coach => {
      if (filteredCoachIds.includes(coach.id)) {
        finalCoaches.push(this.userService.withoutPassword(coach));
      }
    });

    return finalCoaches;
  }

  /* End */
}
