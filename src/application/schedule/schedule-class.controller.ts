import {
  Controller,
  Delete,
  Patch,
  Post,
  Body,
  Param,
  Query,
  Get,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {Prisma, Event, EventContainerNoteType} from '@prisma/client';
import {EventService} from '@microservices/event-scheduling/event.service';
import {
  datePlusMinutes,
  dayOfWeek,
  weekOfMonth,
  weekOfYear,
} from '@toolkit/utilities/datetime.util';
import {EventIssueService} from '@microservices/event-scheduling/event-issue.service';
import {EventTypeService} from '@microservices/event-scheduling/event-type.service';
import {EventContainerNoteService} from '@microservices/event-scheduling/event-container-note.service';
import {EventContainerService} from '@microservices/event-scheduling/event-container.service';
import {UserProfileService} from '@microservices/account/user/user-profile.service';
import {AvailabilityTimeslotService} from '@microservices/event-scheduling/availability-timeslot.service';

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
    private readonly eventContainerNoteService: EventContainerNoteService,
    private readonly userProfileService: UserProfileService
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
    });

    // [step 2] Note add event.
    await this.eventContainerNoteService.create({
      data: {
        type: EventContainerNoteType.SYSTEM,
        description:
          'New class: ' + eventType.name + ' at ' + body.datetimeOfStart,
        containerId: body.containerId,
      },
    });

    // [step 3] Checkin coach availability timeslots.
    await this.availabilityTimeslotService.checkin(event);

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
      },
    });

    // Get all the coaches information
    const coachProfiles = await this.userProfileService.findMany({
      select: {userId: true, fullName: true, coachingTenure: true},
    });
    const coachProfilesMapping = coachProfiles.reduce(
      (obj, item) => ({
        ...obj,
        [item.userId]: item,
      }),
      {}
    );

    // Get all the event types
    const eventTypes = await this.eventTypeService.findMany({});
    const eventTypesMapping = eventTypes.reduce(
      (obj, item) => ({...obj, [item.id]: item.name}),
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

      // Attach class type information
      if (event.typeId) {
        event['type'] = eventTypesMapping[event.typeId];
      } else {
        event['type'] = '';
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
    });

    // [step 3] Checkin coach availability timeslots.
    await this.availabilityTimeslotService.checkin(newEvent);

    // [step 4] Check event issues.
    newEvent['issues'] = await this.eventIssueService.check(newEvent);

    return newEvent;
  }

  @Delete(':eventId')
  async deleteEvent(@Param('eventId') eventId: number): Promise<Event> {
    const event = await this.eventService.findUniqueOrThrow({
      where: {id: eventId},
    });

    // [step 1] Undo the checkin of coach availability timeslots.
    await this.availabilityTimeslotService.undoCheckin(event);

    // [step 2] Delete the event.
    await this.eventService.delete({
      where: {id: eventId},
      include: {type: true},
    });

    // [step 3] Note the deletion.
    await this.eventContainerNoteService.create({
      data: {
        type: EventContainerNoteType.SYSTEM,
        description:
          'Remove class: ' +
          event['type'].name +
          ' at ' +
          event.datetimeOfStart,
        containerId: event.containerId,
      },
    });

    return event;
  }

  /* End */
}
