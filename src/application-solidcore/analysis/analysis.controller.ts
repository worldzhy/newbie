import {Controller, Query, Get} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {daysOfMonth} from '@toolkit/utilities/datetime.util';
import {Prisma} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {RoleService} from '@microservices/account/role/role.service';

@ApiTags('Solidcore / Analysis')
@ApiBearerAuth()
@Controller('analysis')
export class AnalysisController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('coaches')
  async getCoachesUnderQuota(@Query('containerId') containerId: number) {
    const resultOfAnalysis: {
      id: number;
      description: string;
      data: object[];
    }[] = [];

    // [step 1] Get container and coaches.
    const userSelectArgs: Prisma.UserSelect = {
      id: true,
      profile: {
        select: {
          fullName: true,
          quotaOfWeekMax: true,
          quotaOfWeekMin: true,
        },
      },
    };
    type UserResult = Prisma.Result<
      typeof this.prisma.user,
      {select: typeof userSelectArgs},
      'findUniqueOrThrow'
    >;
    const container = await this.prisma.eventContainer.findUniqueOrThrow({
      where: {id: containerId},
    });
    const coaches = await this.prisma.user.findMany({
      where: {
        roles: {some: {name: RoleService.RoleName.EVENT_HOST}},
        profile: {eventVenueIds: {has: container.venueId}},
      },
      select: userSelectArgs,
    });

    if (coaches.length === 0) {
      return resultOfAnalysis;
    }

    // [step 2] Analyse coaches.
    const calendar = daysOfMonth(container.year, container.month);
    const coachesUnderQuota: UserResult[] = [];
    const coachesOverQuota: UserResult[] = [];
    const coachScheduledMost: {
      coach: UserResult;
      countOfScheduledClass: number;
    } = {coach: coaches[0], countOfScheduledClass: 0};
    const coachScheduledLeast: {
      coach: UserResult;
      countOfScheduledClass: number;
    } = {coach: coaches[0], countOfScheduledClass: 0};

    for (let i = 0; i < coaches.length; i++) {
      const coach = coaches[i];
      const quotaOfWeekMin = coach.profile!.quotaOfWeekMin!;
      const quotaOfWeekMax = coach.profile!.quotaOfWeekMax!;

      for (let indexOfWeek = 0; indexOfWeek < calendar.length; indexOfWeek++) {
        if (calendar[indexOfWeek].length === 7) {
          const countOfScheduledClass = await this.prisma.event.count({
            where: {
              hostUserId: coach.id,
              year: container.year,
              month: container.month,
              weekOfMonth: indexOfWeek + 1,
            },
          });
          coach.profile!['countOfScheduledClass'] = countOfScheduledClass;

          if (countOfScheduledClass < quotaOfWeekMin) {
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
          if (countOfScheduledClass > quotaOfWeekMax) {
            let existed = false;
            for (let s = 0; s < coachesOverQuota.length; s++) {
              const element = coachesOverQuota[s];
              if (element.id === coach.id) {
                existed = true;
              }
            }
            if (!existed) {
              coachesOverQuota.push(coach);
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
        data: coachesUnderQuota,
      },
      {
        id: 3,
        description: 'The coaches over preferred maximum quota',
        data: coachesOverQuota,
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
