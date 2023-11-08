import {Controller, Get, Param, Query} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {
  Event,
  EventContainerNoteType,
  EventIssue,
  EventIssueStatus,
  EventIssueType,
} from '@prisma/client';
import {EventService} from '@microservices/event-scheduling/event.service';
import {EventIssueService} from '@microservices/event-scheduling/event-issue.service';
import {CoachService} from '../coach/coach.service';
import {EventContainerNoteService} from '@microservices/event-scheduling/event-container-note.service';
import {EventContainerService} from '@microservices/event-scheduling/event-container.service';
import {UserProfileService} from '@microservices/account/user/user-profile.service';
import {AvailabilityTimeslotService} from '@microservices/event-scheduling/availability-timeslot.service';

@ApiTags('Event Container')
@ApiBearerAuth()
@Controller('event-containers')
export class EventFixController {
  constructor(
    private readonly availabilityTimeslotService: AvailabilityTimeslotService,
    private readonly eventService: EventService,
    private readonly eventIssueService: EventIssueService,
    private readonly eventContainerService: EventContainerService,
    private readonly eventContainerNoteService: EventContainerNoteService,
    private readonly coachService: CoachService,
    private readonly userProfileService: UserProfileService
  ) {}

  @Get(':eventContainerId/fix')
  async fixEventContainer(
    @Param('eventContainerId') eventContainerId: number,
    @Query('weekOfMonth') weekOfMonth: number
  ) {
    const container = await this.eventContainerService.findUniqueOrThrow({
      where: {id: eventContainerId},
    });
    // [step 1] Get events.
    const events = await this.eventService.findMany({
      where: {
        containerId: eventContainerId,
        year: container.year,
        month: container.month,
        weekOfMonth,
      },
      include: {issues: {where: {status: EventIssueStatus.UNREPAIRED}}},
    });

    // [step 2] Fix issues.
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      // [step 2-1] Undo the checkin of coach availability timeslots.
      await this.availabilityTimeslotService.undoCheckin(event);

      // [step 2-2] Fix issues.
      for (let j = 0; j < event['issues'].length; j++) {
        const issue = event['issues'][j];
        switch (issue.type) {
          case EventIssueType.ERROR_COACH_NOT_EXISTED:
          case EventIssueType.ERROR_COACH_NOT_CONFIGURED:
          case EventIssueType.ERROR_COACH_NOT_AVAILABLE_FOR_EVENT_TIME:
          case EventIssueType.ERROR_COACH_NOT_AVAILABLE_FOR_EVENT_TYPE:
          case EventIssueType.ERROR_COACH_NOT_AVAILABLE_FOR_EVENT_VENUE:
            await this.fixIssue(event, issue);
        }
      }

      // [step 2-3] Checkin coach availability timeslots.
      const newEvent = await this.eventService.findUniqueOrThrow({
        where: {id: event.id},
      });
      await this.availabilityTimeslotService.checkin(newEvent);
    }
  }

  async fixIssue(event: Event, issue: EventIssue) {
    // [step 1] Get and set suitable coach.
    const coaches = await this.coachService.getSortedCoachesForEvent(event);
    if (coaches.length > 0) {
      await this.eventService.update({
        where: {id: event.id},
        data: {hostUserId: coaches[0].id},
      });

      // [step 2] Mark the issue is repaired.
      await this.eventIssueService.update({
        where: {id: issue.id},
        data: {status: EventIssueStatus.REPAIRED},
      });

      // [step 3] Write change note.
      let description = 'Coach changed:';
      switch (issue.type) {
        case EventIssueType.ERROR_COACH_NOT_EXISTED:
          description =
            'Coach changed: No coach' + ' -> ' + coaches[0]['profile'].fullName;
        case EventIssueType.ERROR_COACH_NOT_AVAILABLE_FOR_EVENT_TIME:
        case EventIssueType.ERROR_COACH_NOT_AVAILABLE_FOR_EVENT_TYPE:
        case EventIssueType.ERROR_COACH_NOT_AVAILABLE_FOR_EVENT_VENUE: {
          if (event.hostUserId) {
            const userProfile = await this.userProfileService.findUniqueOrThrow(
              {
                where: {userId: event.hostUserId},
                select: {fullName: true},
              }
            );
            description =
              'Coach changed: ' +
              userProfile.fullName +
              ' -> ' +
              coaches[0]['profile'].fullName;
          }
        }
      }
      await this.eventContainerNoteService.create({
        data: {
          type: EventContainerNoteType.SYSTEM,
          description,
          containerId: event.containerId,
        },
      });
    }
  }

  /* End */
}
