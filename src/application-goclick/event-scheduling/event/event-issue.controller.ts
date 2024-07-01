import {Controller, Get, Param, Query} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {
  Event,
  EventIssue,
  EventIssueStatus,
  EventIssueType,
  EventChangeLogType,
} from '@prisma/client';
import {EventHostService} from '@microservices/event-scheduling/event-host.service';
import {EventIssueService} from '@microservices/event-scheduling/event-issue.service';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import _ from 'lodash';

@ApiTags('Event Scheduling / Event Issue')
@ApiBearerAuth()
@Controller('event-issues')
export class EventIssueController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventHostService: EventHostService,
    private readonly eventIssueService: EventIssueService
  ) {}

  @Get(':eventContainerId/check')
  async checkEventContainerOld(
    @Param('eventContainerId') eventContainerId: number,
    @Query('weekOfMonth') weekOfMonth: number
  ) {
    // Get event container.
    const container = await this.prisma.eventContainer.findUniqueOrThrow({
      where: {id: eventContainerId},
    });

    const events = await this.prisma.event.findMany({
      where: {
        containerId: eventContainerId,
        year: container.year,
        month: container.month,
        weekOfMonth,
        deletedAt: null,
      },
    });

    // Check each issue.
    for (let i = 0; i < events.length; i++) {
      await this.eventIssueService.check(events[i]);
    }

    return await this.prisma.eventIssue.findMany({
      where: {
        status: EventIssueStatus.UNREPAIRED,
        event: {
          containerId: eventContainerId,
          year: container.year,
          month: container.month,
          weekOfMonth,
        },
      },
    });
  }

  @Get(':eventContainerId/fix')
  async fixEventContainer(
    @Param('eventContainerId') eventContainerId: number,
    @Query('weekOfMonth') weekOfMonth: number
  ) {
    const container = await this.prisma.eventContainer.findUniqueOrThrow({
      where: {id: eventContainerId},
    });
    // [step 1] Get events.
    const events = await this.prisma.event.findMany({
      where: {
        containerId: eventContainerId,
        year: container.year,
        month: container.month,
        weekOfMonth,
        deletedAt: null,
      },
      include: {issues: {where: {status: EventIssueStatus.UNREPAIRED}}},
    });

    // [step 2] Fix issues.
    for (let i = 0; i < events.length; i++) {
      const event = events[i];

      for (let j = 0; j < event['issues'].length; j++) {
        const issue = event['issues'][j];
        await this.fixIssue(event, issue);
      }
    }
  }

  private async fixIssue(event: Event, issue: EventIssue) {
    // [step 1] Get and set suitable coach.
    const coaches =
      await this.eventHostService.getSortedCoachesWithQuotaLimit(event);
    if (coaches.length > 0) {
      await this.prisma.event.update({
        where: {id: event.id},
        data: {hostUserId: coaches[0].id},
      });

      // [step 2] Mark the issue is repaired.
      await this.prisma.eventIssue.update({
        where: {id: issue.id},
        data: {status: EventIssueStatus.REPAIRED},
      });

      // [step 3] Write change note.
      let description = 'Coach changed:';
      switch (issue.type) {
        case EventIssueType.ERROR_NONEXISTENT_COACH:
          description =
            'Coach changed: No coach' + ' -> ' + coaches[0].profile?.fullName;
        case EventIssueType.ERROR_CONFLICTING_EVENT_TIME:
        case EventIssueType.ERROR_UNAVAILABLE_EVENT_TIME:
        case EventIssueType.ERROR_UNAVAILABLE_EVENT_TYPE:
        case EventIssueType.ERROR_UNAVAILABLE_EVENT_VENUE: {
          if (event.hostUserId) {
            const userProfile =
              await this.prisma.userSingleProfile.findUniqueOrThrow({
                where: {userId: event.hostUserId},
                select: {fullName: true},
              });
            description =
              'Coach changed: ' +
              userProfile.fullName +
              ' -> ' +
              coaches[0].profile?.fullName;
          }
        }
      }
      await this.prisma.eventChangeLog.create({
        data: {
          type: EventChangeLogType.SYSTEM,
          description,
          eventContainerId: event.containerId,
          eventId: event.id,
        },
      });
    }
  }

  /* End */
}
