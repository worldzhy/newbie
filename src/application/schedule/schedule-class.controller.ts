import {
  Controller,
  Delete,
  Patch,
  Post,
  Body,
  Param,
  Query,
  Get,
  BadRequestException,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {
  Prisma,
  Event,
  EventChangeLogType,
  EventIssueStatus,
} from '@prisma/client';
import {EventService} from '@microservices/event-scheduling/event.service';
import {
  datePlusMinutes,
  dayOfWeek,
  weekOfMonth,
  weekOfYear,
} from '@toolkit/utilities/datetime.util';
import {EventIssueService} from '@microservices/event-scheduling/event-issue.service';
import {EventTypeService} from '@microservices/event-scheduling/event-type.service';
import {EventChangeLogService} from '@microservices/event-scheduling/event-change-log.service';
import {EventContainerService} from '@microservices/event-scheduling/event-container.service';
import {UserProfileService} from '@microservices/account/user/user-profile.service';
import {AvailabilityTimeslotService} from '@microservices/event-scheduling/availability-timeslot.service';
import {ScToMbService} from '@microservices/mindbody/scToMb.service';

@ApiTags('Event')
@ApiBearerAuth()
@Controller('events')
export class EventController {
  constructor(
    private readonly availabilityTimeslotService: AvailabilityTimeslotService,
    private readonly eventService: EventService,
    private readonly eventIssueService: EventIssueService,
    private readonly eventTypeService: EventTypeService,
    private readonly eventContainerService: EventContainerService,
    private readonly eventChangeLogService: EventChangeLogService,
    private readonly userProfileService: UserProfileService,
    private readonly scToMbService: ScToMbService
  ) {}

  @Post('')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          hostUserId: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
          year: 2023,
          month: 9,
          dayOfMonth: 1,
          hour: 6,
          minute: 0,
          typeId: 1,
          venueId: 1,
          containerId: 1,
        },
      },
    },
  })
  async createEvent(
    @Body()
    body: Prisma.EventUncheckedCreateInput
  ): Promise<Event> {
    if (!body.hostUserId) {
      throw new BadRequestException('hostUserId is required.');
    }

    // [step 1] Create event.
    const eventType = await this.eventTypeService.findUniqueOrThrow({
      where: {id: body.typeId},
    });
    body.minutesOfDuration = eventType.minutesOfDuration;
    body.datetimeOfStart = new Date(
      body.year,
      body.month - 1,
      body.dayOfMonth,
      body.hour,
      body.minute
    );
    body.datetimeOfEnd = datePlusMinutes(
      body.datetimeOfStart,
      body.minutesOfDuration
    );
    body.dayOfWeek = dayOfWeek(body.year, body.month, body.dayOfMonth);
    body.weekOfMonth = weekOfMonth(body.year, body.month, body.dayOfMonth);
    body.weekOfYear = weekOfYear(body.year, body.month, body.dayOfMonth);

    const event = await this.eventService.create({
      data: body,
      include: {type: true},
    });

    // [step 2] Note add event.
    await this.eventChangeLogService.create({
      data: {
        type: EventChangeLogType.USER,
        description:
          'New class: ' + eventType.name + ' at ' + body.datetimeOfStart,
        eventContainerId: body.containerId,
        eventId: event.id,
      },
    });

    // [step 3] Checkin coach availability timeslots.
    await this.availabilityTimeslotService.checkin(event);

    // [step 4] Check event issues.
    await this.eventIssueService.check(event);

    // [step 5] Attach information.
    event['issues'] = await this.eventIssueService.findMany({
      where: {status: EventIssueStatus.UNREPAIRED, eventId: event.id},
    });

    event['hostUser'] = await this.userProfileService.findUniqueOrThrow({
      where: {userId: body.hostUserId},
      select: {userId: true, fullName: true, coachingTenure: true},
    });

    return event;
  }

  @Get('')
  async getEvents(
    @Query('eventContainerId') eventContainerId: number,
    @Query('weekOfMonth') weekOfMonth: number
  ) {
    const container = await this.eventContainerService.findUniqueOrThrow({
      where: {id: eventContainerId},
    });

    const events = await this.eventService.findMany({
      where: {
        containerId: eventContainerId,
        year: container.year,
        month: container.month,
        weekOfMonth,
        deletedAt: null,
      },
      include: {type: true},
    });

    // Get all the coaches information
    const coachIds = events
      .map(event => {
        return event.hostUserId;
      })
      .filter(coachId => coachId !== null) as string[];
    const coachProfiles = await this.userProfileService.findMany({
      where: {userId: {in: coachIds}},
      select: {userId: true, fullName: true, coachingTenure: true},
    });
    const coachProfilesMapping = coachProfiles.reduce(
      (obj, item) => ({
        ...obj,
        [item.userId]: item,
      }),
      {}
    );

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      // Attach coach information
      if (event.hostUserId) {
        event['hostUser'] = coachProfilesMapping[event.hostUserId];
      } else {
        event['hostUser'] = {};
      }
    }

    return events;
  }

  @Patch(':eventId')
  @ApiBody({
    description:
      'Set roleIds with an empty array to remove all the roles of the event.',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          hostUserId: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
          year: 2023,
          month: 9,
          dayOfMonth: 1,
          dayOfWeek: 5,
          hour: 6,
          minute: 0,
          typeId: 1,
          venueId: 1,
          containerId: 1,
        },
      },
    },
  })
  async updateEvent(
    @Param('eventId') eventId: number,
    @Body()
    body: Prisma.EventUncheckedUpdateInput
  ): Promise<Event> {
    if (body.typeId) {
      const eventType = await this.eventTypeService.findUniqueOrThrow({
        where: {id: body.typeId as number},
      });
      body.minutesOfDuration = eventType.minutesOfDuration;
    }

    // [step 1] Undo the checkin of coach availability timeslots.
    const oldEvent = await this.eventService.findUniqueOrThrow({
      where: {id: eventId},
    });
    await this.availabilityTimeslotService.undoCheckin(oldEvent);

    // [step 2] Update event.
    const newEvent = await this.eventService.update({
      where: {id: eventId},
      data: body,
      include: {type: true},
    });

    // [step 3] Note the update.
    await this.eventChangeLogService.create({
      data: {
        type: EventChangeLogType.USER,
        description:
          'Update class: ' +
          newEvent['type'].name +
          ' at ' +
          newEvent.datetimeOfStart,
        eventContainerId: newEvent.containerId,
        eventId: eventId,
      },
    });

    // [step 4] Checkin coach availability timeslots.
    await this.availabilityTimeslotService.checkin(newEvent);

    // [step 5] Check event issues.
    await this.eventIssueService.check(newEvent);

    // [step 6] Attach information.
    newEvent['issues'] = await this.eventIssueService.findMany({
      where: {status: EventIssueStatus.UNREPAIRED, eventId: newEvent.id},
    });

    if (newEvent.hostUserId) {
      newEvent['hostUser'] = await this.userProfileService.findUniqueOrThrow({
        where: {userId: newEvent.hostUserId},
        select: {userId: true, fullName: true, coachingTenure: true},
      });
    }

    return newEvent;
  }

  @Patch(':eventId/lock')
  @ApiBody({
    description: 'Lock the event.',
    examples: {
      a: {
        summary: '1. Lock',
        value: {
          isLocked: true,
        },
      },
      b: {
        summary: '1. Unlock',
        value: {
          isLocked: false,
        },
      },
    },
  })
  async lockEvent(
    @Param('eventId') eventId: number,
    @Body()
    body: Prisma.EventUncheckedUpdateInput
  ): Promise<Event> {
    if (body.isLocked) {
      return await this.eventService.update({
        where: {id: eventId},
        data: {isLocked: true},
      });
    } else {
      return await this.eventService.update({
        where: {id: eventId},
        data: {isLocked: false},
      });
    }
  }

  @Delete(':eventId')
  async deleteEvent(@Param('eventId') eventId: number): Promise<Event> {
    const event = await this.eventService.findUniqueOrThrow({
      where: {id: eventId},
      include: {type: true},
    });

    // [step 1] Undo the checkin of coach availability timeslots.
    await this.availabilityTimeslotService.undoCheckin(event);

    // [step 2] Delete the event.
    await this.eventService.delete({
      where: {id: eventId},
      include: {type: true},
    });

    // [step 3] Note the deletion.
    await this.eventChangeLogService.create({
      data: {
        type: EventChangeLogType.USER,
        description:
          'Remove class: ' +
          event['type'].name +
          ' at ' +
          event.datetimeOfStart,
        eventContainerId: event.containerId,
        eventId: eventId,
      },
    });

    return event;
  }

  @Patch(':eventId/publish')
  async publishEvent(@Param('eventId') eventId: number) {
    // [step 1] Get the record.
    // const event = await this.eventService.findUniqueOrThrow({
    //   where: {id: eventId},
    // });
    const event = await this.eventService.findUniqueOrThrow({
      where: {id: eventId},
      include: {type: true, venue: true, changeLogs: true},
    });

    await this.scToMbService.eventPublish(event);
    const resp = this.scToMbService.getResult();

    return resp;

    // [step 2] Modify coaches' availability status
    // await this.availabilityTimeslotService.checkin(event);

    // [step 2] Update event status.
    // return await this.eventService.update({
    //   where: {id: eventId},
    //   data: {isPublished: true},
    // });
    return event;
  }

  /* End */
}
