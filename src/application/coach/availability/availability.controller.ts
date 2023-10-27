import {
  Body,
  Controller,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {ApiBearerAuth, ApiBody, ApiTags} from '@nestjs/swagger';
import {FileInterceptor} from '@nestjs/platform-express';
import {Express} from 'express';
import {XLSXService} from '@toolkit/xlsx/xlsx.service';
import {UserService} from '@microservices/account/user/user.service';
import {UserProfileService} from '@microservices/account/user/user-profile.service';
import {AvailabilityExpressionService} from '@microservices/event-scheduling/availability-expression.service';
import {AvailabilityTimeslotService} from '@microservices/event-scheduling/availability-timeslot.service';
import {AvailabilityExpressionStatus} from '@prisma/client';
import {EventVenueService} from '@microservices/event-scheduling/event-venue.service';
import {
  firstDayOfMonth,
  lastDayOfMonth,
} from '@toolkit/utilities/datetime.util';

const HOUR_OF_DAY_START = 5;
const HOUR_OF_DAY_END = 22;
const COACH_AVAILABILITY_DURATION_GOOGLE_FORM = 15;
enum QUARTER {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4',
}

@ApiTags('Availability')
@ApiBearerAuth()
@Controller('availability')
export class AvailabilityController {
  constructor(
    private readonly userService: UserService,
    private readonly userProfileService: UserProfileService,
    private readonly availabilityExpressionService: AvailabilityExpressionService,
    private readonly availabilityTimeslotService: AvailabilityTimeslotService,
    private readonly eventVenueService: EventVenueService
  ) {}

  @Post('load')
  @ApiBody({
    description: '',
    examples: {
      a: {value: {year: 2023, quarter: 'Q4'}},
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async loadAvailabilityFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType:
            'application/vnd.ms-excel|application/msexcel|application/xls|application/x-xls|application/x-excel|application/x-dos_ms_excel|application/x-ms-excel|application/x-msexcel|application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .build()
    )
    file: Express.Multer.File,
    @Body() body: {year: string; quarter: QUARTER}
  ) {
    // [step 1] Process quarter.
    const year = parseInt(body.year);
    let stringMonths = '1';
    let dateOfOpening = new Date();
    let dateOfClosure = new Date();
    switch (body.quarter) {
      case QUARTER.Q1:
        stringMonths = '1-3';
        dateOfOpening = firstDayOfMonth(year, 1);
        dateOfClosure = lastDayOfMonth(year, 3);
      case QUARTER.Q2:
        stringMonths = '4-6';
        dateOfOpening = firstDayOfMonth(year, 4);
        dateOfClosure = lastDayOfMonth(year, 6);
      case QUARTER.Q3:
        stringMonths = '7-9';
        dateOfOpening = firstDayOfMonth(year, 7);
        dateOfClosure = lastDayOfMonth(year, 9);
      case QUARTER.Q4:
        stringMonths = '10-12';
        dateOfOpening = firstDayOfMonth(year, 10);
        dateOfClosure = lastDayOfMonth(year, 12);
    }

    // [step 2] Process excel data.
    const xlsx = new XLSXService();
    xlsx.loadFile(file);

    const sheets = xlsx.getSheets();
    const sheet = sheets[0];
    const rows = xlsx.getDataRows(sheet);
    for (let i = 0; i < rows.length; i++) {
      // [step 2-1] Get the coach.
      const row = rows[i];
      if (!row['Email'].trim()) {
        continue;
      }

      const coach = await this.userService.findUnique({
        where: {email: row['Email'].trim().toLowerCase()},
        select: {id: true, profile: {select: {fullName: true}}},
      });
      if (!coach) {
        continue;
      }

      // [step 2-2] Generate coach availability expression.
      const cronExpressions: string[] = [];
      const coachLocationNames: string[] = [];
      for (const key in row) {
        // 1) Process weekday availability
        let isTimeKey = false;
        let hour: number = 0;
        let minute: number = 0;
        if (key.endsWith('am]')) {
          isTimeKey = true;
          const time = key
            .replace('Select your weekday availability: [', '')
            .replace('am]', '');
          const hourAndMinute = time.split(':');
          hour = parseInt(hourAndMinute[0]);
          minute = parseInt(hourAndMinute[1]);
        } else if (key.endsWith('pm]')) {
          isTimeKey = true;
          const time = key
            .replace('Select your weekday availability: [', '')
            .replace('pm]', '');
          const hourAndMinute = time.split(':');
          hour = parseInt(hourAndMinute[0]);
          minute = parseInt(hourAndMinute[1]);
          if (hour !== 12) {
            hour += 12;
          }
        } else {
        }

        if (isTimeKey) {
          const weekdays = row[key].split(';');
          const stringWeekdays = weekdays
            .map((weekday: string) => {
              switch (weekday) {
                case 'Monday':
                  return 1;
                case 'Tuesday':
                  return 2;
                case 'Wednesday':
                  return 3;
                case 'Thursday':
                  return 4;
                case 'Friday':
                  return 5;
              }
            })
            .toString(); // Return '1,2,3,4,5'
          cronExpressions.push(
            `${minute} ${hour} * ${stringMonths} ${stringWeekdays}`
          );
        }

        // 2) Process weekend availability.
        if (key.startsWith('Select your weekend day of availability')) {
          const weekdays = row[key].split(';');
          const stringWeekdays = weekdays
            .map((weekday: string) => {
              switch (weekday) {
                case 'Saturday':
                  return 6;
                case 'Sunday':
                  return 0;
              }
            })
            .toString(); // Return '6,0'
          cronExpressions.push(
            `0 ${HOUR_OF_DAY_START}-${HOUR_OF_DAY_END} * ${stringMonths} ${stringWeekdays}`
          );
        }

        // 3) Process coach locations.
        if (key.startsWith('Select your home studio')) {
          const location = row[key]
            .replace(' -', ',')
            .replace(' & ', '&')
            .trim();
          if (!coachLocationNames.includes(location)) {
            coachLocationNames.push(location);
          }
        }
        if (key.startsWith('Select additional studios')) {
          row[key].split(';').map((location: string) => {
            location = location.replace(' -', ',').replace(' & ', '&').trim();
            if (!coachLocationNames.includes(location)) {
              coachLocationNames.push(location);
            }
          });
        }
      }

      // [step 2-3] Create or overwrite coach availability expression.
      const venues = await this.eventVenueService.findMany({
        where: {name: {in: coachLocationNames}},
        select: {id: true},
      });
      const coachLocationIds = venues.map(venue => {
        return venue.id;
      });

      await this.availabilityExpressionService.deleteMany({
        where: {
          name: {contains: body.year + ' ' + body.quarter, mode: 'insensitive'},
          hostUserId: coach.id,
        },
      });
      const availabilityExpression =
        await this.availabilityExpressionService.create({
          data: {
            name:
              coach['profile'].fullName +
              ' - ' +
              body.year +
              ' ' +
              body.quarter,
            hostUserId: coach.id,
            venueIds: coachLocationIds,
            cronExpressionsOfAvailableTimePoints: cronExpressions,
            dateOfOpening,
            dateOfClosure,
            minutesOfDuration: COACH_AVAILABILITY_DURATION_GOOGLE_FORM,
          },
        });

      // [step 2-4] Parse expression to timeslots.
      const availabilityTimeslots =
        await this.availabilityExpressionService.parse(
          availabilityExpression.id
        );
      await this.availabilityTimeslotService.deleteMany({
        where: {expressionId: availabilityExpression.id},
      });
      await this.availabilityTimeslotService.createMany({
        data: availabilityTimeslots,
      });
      await this.availabilityExpressionService.update({
        where: {id: availabilityExpression.id},
        data: {
          status: AvailabilityExpressionStatus.PUBLISHED,
        },
      });

      // [step 2-5] Update coach profile.
      await this.userProfileService.update({
        where: {userId: coach.id},
        data: {
          eventVenueIds: coachLocationIds,
          quotaOfWeekMinPreference:
            row['Select minimum # of preferred classes:'],
          quotaOfWeekMaxPreference:
            row['Select maximum # of preferred classes:'],
        },
      });
    }
  }

  // End
}
