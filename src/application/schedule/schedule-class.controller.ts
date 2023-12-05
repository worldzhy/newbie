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
import {EventIssueService} from '@microservices/event-scheduling/event-issue.service';
import {EventTypeService} from '@microservices/event-scheduling/event-type.service';
import {EventChangeLogService} from '@microservices/event-scheduling/event-change-log.service';
import {EventContainerService} from '@microservices/event-scheduling/event-container.service';
import {UserProfileService} from '@microservices/account/user/user-profile.service';
import {ScToMbService} from '@microservices/mindbody/scToMb.service';
import {sameDaysOfMonth} from '@toolkit/utilities/datetime.util';

@ApiTags('Event')
@ApiBearerAuth()
@Controller('events')
export class EventController {
  constructor(
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
          datetimeOfStart: '2023-11-28 17:40:05.025 +0800',
          typeId: 1,
          venueId: 1,
          containerId: 1,
          needToDuplicate: true,
        },
      },
    },
  })
  async createEvent(
    @Body()
    body: Prisma.EventUncheckedCreateInput & {needToDuplicate?: boolean}
  ): Promise<Event> {
    if (!body.hostUserId) {
      throw new BadRequestException('hostUserId is required.');
    }

    // [step 1] Create event.
    const eventType = await this.eventTypeService.findUniqueOrThrow({
      where: {id: body.typeId},
    });
    body.minutesOfDuration = eventType.minutesOfDuration;

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

    // [step 3] Check event issues.
    await this.eventIssueService.check(event);

    // [step 4] Attach information.
    event['issues'] = await this.eventIssueService.findMany({
      where: {status: EventIssueStatus.UNREPAIRED, eventId: event.id},
    });
    event['hostUser'] = await this.userProfileService.findUniqueOrThrow({
      where: {userId: body.hostUserId},
      select: {userId: true, fullName: true, coachingTenure: true},
    });

    // [step 5] Duplicate events.
    if (body.needToDuplicate) {
      const sameDays = sameDaysOfMonth(
        event.year,
        event.month,
        event.dayOfMonth
      );
      for (let i = 0; i < sameDays.length; i++) {
        const sameDay = sameDays[i];
        if (sameDay.dayOfMonth === event.dayOfMonth) {
          continue;
        }

        const newDatetimeOfStart = new Date(event.datetimeOfStart);
        newDatetimeOfStart.setDate(sameDay.dayOfMonth);

        const newOtherEvent = await this.eventService.create({
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
        await this.eventChangeLogService.create({
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
          datetimeOfStart: '2023-11-28 17:40:05.025 +0800',
          typeId: 1,
          venueId: 1,
          containerId: 1,
          needToDuplicate: true,
        },
      },
    },
  })
  async updateEvent(
    @Param('eventId') eventId: number,
    @Body()
    body: Prisma.EventUncheckedUpdateInput & {needToDuplicate?: boolean}
  ): Promise<Event> {
    // [step 0] Collect events to be repeated in this month.
    const otherEvents: object[] = [];
    if (body.needToDuplicate) {
      const oldEvent = await this.eventService.findUniqueOrThrow({
        where: {id: eventId},
      });
      otherEvents.push(
        ...(await this.eventService.findMany({
          where: {
            id: {not: eventId},
            containerId: oldEvent.containerId,
            hostUserId: oldEvent.hostUserId,
            typeId: oldEvent.typeId,
            hour: oldEvent.hour,
            minute: oldEvent.minute,
            dayOfWeek: oldEvent.dayOfWeek,
          },
        }))
      );
    }
    delete body.needToDuplicate;

    // [step 1] Update event.
    if (body.typeId) {
      const eventType = await this.eventTypeService.findUniqueOrThrow({
        where: {id: body.typeId as number},
      });
      body.minutesOfDuration = eventType.minutesOfDuration;
    }
    const newEvent = await this.eventService.update({
      where: {id: eventId},
      data: body,
      include: {type: true},
    });

    // [step 2] Note the update.
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

    // [step 3] Check event issues.
    await this.eventIssueService.check(newEvent);

    // [step 4] Attach information.
    newEvent['issues'] = await this.eventIssueService.findMany({
      where: {status: EventIssueStatus.UNREPAIRED, eventId: newEvent.id},
    });

    if (newEvent.hostUserId) {
      newEvent['hostUser'] = await this.userProfileService.findUniqueOrThrow({
        where: {userId: newEvent.hostUserId},
        select: {userId: true, fullName: true, coachingTenure: true},
      });
    }

    // [step 5] Duplicate events.
    for (let i = 0; i < otherEvents.length; i++) {
      const otherEvent = otherEvents[i] as Event;
      const newDatetimeOfStart = otherEvent.datetimeOfStart;
      newDatetimeOfStart.setHours(newEvent.datetimeOfStart.getHours());
      newDatetimeOfStart.setMinutes(newEvent.datetimeOfStart.getMinutes());

      const newOtherEvent = await this.eventService.update({
        where: {id: otherEvent.id},
        data: {
          hostUserId: newEvent.hostUserId,
          typeId: newEvent.typeId,
          datetimeOfStart: newDatetimeOfStart,
          minutesOfDuration: newEvent.minutesOfDuration,
          timeZone: newEvent.timeZone,
        },
      });

      // Note the update.
      await this.eventChangeLogService.create({
        data: {
          type: EventChangeLogType.USER,
          description:
            'Update class: ' +
            newEvent['type'].name +
            ' at ' +
            newOtherEvent.datetimeOfStart,
          eventContainerId: newOtherEvent.containerId,
          eventId: newOtherEvent.id,
        },
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
    // [step 1] Get the event.
    const event = await this.eventService.findUniqueOrThrow({
      where: {id: eventId},
      include: {type: true},
    });

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
  async publishEvent(@Param('eventId') eventId: number, @Body() body) {
    const event = await this.eventService.findUniqueOrThrow({
      where: {id: eventId},
      include: {type: true, venue: true, changeLogs: true},
    });

    const {checkResult} = body;

    if (checkResult) {
      this.scToMbService.setCheckResult(checkResult);
    } else {
      const {_event, _body} = this.scToMbService.parseBodyEvent({
        body,
        event,
      });
      await this.scToMbService.eventCheck(_event, _body);
    }

    // await this.scToMbService.eventPublish();
    const resp = this.scToMbService.getResult();

    if (!resp.success) {
      return resp;
    }

    await this.eventService.update({
      where: {id: eventId},
      data: {isPublished: true},
    });
    return resp;
  }

  @Patch(':eventId/publishCheck')
  async publishCheck(@Param('eventId') eventId: number, @Body() body) {
    const event = await this.eventService.findUniqueOrThrow({
      where: {id: eventId},
      include: {type: true, venue: true, changeLogs: true},
    });

    const {_event, _body} = this.scToMbService.parseBodyEvent({
      body,
      event,
    });
    await this.scToMbService.eventCheck(_event, _body);
    await this.scToMbService.eventPublish;
    const resp = this.scToMbService.getResult();

    return resp;
  }

  /* End */
}
