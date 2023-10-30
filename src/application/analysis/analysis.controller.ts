import {Controller, Query, Get} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {UserService} from '@microservices/account/user/user.service';
import {EventContainerService} from '@microservices/event-scheduling/event-container.service';
import {EventService} from '@microservices/event-scheduling/event.service';
import {daysOfMonth} from '@toolkit/utilities/datetime.util';
import {User} from '@prisma/client';

const ROLE_NAME_COACH = 'Coach';

@ApiTags('Analysis')
@ApiBearerAuth()
@Controller('analysis')
export class AnalysisController {
  constructor(
    private readonly eventService: EventService,
    private readonly eventContainerService: EventContainerService,
    private readonly userService: UserService
  ) {}

  @Get('coaches')
  async getCoachesUnderQuota(@Query('containerId') containerId: number) {
    const resultOfAnalysis: {
      id: number;
      description: string;
      data: object[];
    }[] = [];

    // [step 1] Get container and coaches.
    const container = await this.eventContainerService.findUniqueOrThrow({
      where: {id: containerId},
    });
    const coaches = await this.userService.findMany({
      where: {
        roles: {some: {name: ROLE_NAME_COACH}},
        profile: {eventVenueIds: {has: container.venueId}},
      },
      select: {
        id: true,
        profile: {
          select: {
            fullName: true,
            quotaOfWeek: true,
            quotaOfWeekMaxPreference: true,
            quotaOfWeekMinPreference: true,
          },
        },
      },
    });

    if (coaches.length === 0) {
      return resultOfAnalysis;
    }

    // [step 2] Analyse coaches.
    const calendar = daysOfMonth(container.year, container.month);
    const coachesUnderQuota: User[] = [];
    const coachesUnderPreferredQuota: User[] = [];
    const coachesOverPreferredQuota: User[] = [];
    const coachScheduledMost: {
      coach: User;
      countOfScheduledClass: number;
    } = {coach: coaches[0], countOfScheduledClass: 0};
    const coachScheduledLeast: {
      coach: User;
      countOfScheduledClass: number;
    } = {coach: coaches[0], countOfScheduledClass: 0};

    for (let i = 0; i < coaches.length; i++) {
      const coach = coaches[i];
      const quotaOfWeek = coach['profile'].quotaOfWeek;
      const quotaOfWeekMinPerference =
        coach['profile'].quotaOfWeekMinPerference;
      const quotaOfWeekMaxPerference =
        coach['profile'].quotaOfWeekMaxPerference;

      for (let indexOfWeek = 0; indexOfWeek < calendar.length; indexOfWeek++) {
        if (calendar[indexOfWeek].length === 7) {
          const countOfScheduledClass = await this.eventService.count({
            where: {
              hostUserId: coach.id,
              venueId: container.venueId,
              weekOfMonth: indexOfWeek + 1,
            },
          });
          coach['profile']['countOfScheduledClass'] = countOfScheduledClass;

          if (countOfScheduledClass < quotaOfWeek) {
            let existed = false;
            for (let r = 0; r < coachesUnderQuota.length; r++) {
              const element = coachesUnderQuota[r];
              if (element.id === coach.id) {
                existed = true;
              }
            }
            if (!existed) {
              coachesUnderQuota.push(coach);
            }
          }
          if (countOfScheduledClass < quotaOfWeekMinPerference) {
            let existed = false;
            for (let s = 0; s < coachesUnderPreferredQuota.length; s++) {
              const element = coachesUnderPreferredQuota[s];
              if (element.id === coach.id) {
                existed = true;
              }
            }
            if (!existed) {
              coachesUnderPreferredQuota.push(coach);
            }
          }
          if (countOfScheduledClass > quotaOfWeekMaxPerference) {
            let existed = false;
            for (let s = 0; s < coachesOverPreferredQuota.length; s++) {
              const element = coachesOverPreferredQuota[s];
              if (element.id === coach.id) {
                existed = true;
              }
            }
            if (!existed) {
              coachesOverPreferredQuota.push(coach);
            }
          }
          if (
            countOfScheduledClass > coachScheduledMost.countOfScheduledClass
          ) {
            coachScheduledMost.coach = coach;
            coachScheduledMost.countOfScheduledClass = countOfScheduledClass;
          }
          if (
            countOfScheduledClass < coachScheduledLeast.countOfScheduledClass
          ) {
            coachScheduledLeast.coach = coach;
            coachScheduledLeast.countOfScheduledClass = countOfScheduledClass;
          }
        }
      }
    }

    // [step 3] Return result of Analysis.
    return resultOfAnalysis.concat([
      {
        id: 1,
        description: 'The coaches under quota',
        data: coachesUnderQuota,
      },
      {
        id: 2,
        description: 'The coaches under preferred minimum quota',
        data: coachesUnderPreferredQuota,
      },
      {
        id: 3,
        description: 'The coaches over preferred maximum quota',
        data: coachesOverPreferredQuota,
      },
      {
        id: 4,
        description: 'The coach scheduled most classes',
        data: [coachScheduledMost.coach],
      },
      {
        id: 5,
        description: 'The coach scheduled least classes',
        data: [coachScheduledLeast.coach],
      },
    ]);
  }

  /* End */
}
