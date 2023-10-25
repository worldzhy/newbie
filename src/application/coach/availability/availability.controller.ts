import {
  Controller,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {FileInterceptor} from '@nestjs/platform-express';
import {Express} from 'express';
import {XLSXService} from '@toolkit/xlsx/xlsx.service';
import {UserProfileService} from '@microservices/account/user/user-profile.service';
import {AvailabilityExpressionService} from '@microservices/event-scheduling/availability-expression.service';
import {AvailabilityTimeslotService} from '@microservices/event-scheduling/availability-timeslot.service';
import {AvailabilityExpressionStatus} from '@prisma/client';

const COACH_AVAILABILITY_DURATION_GOOGLE_FORM = 15;

@ApiTags('Availability')
@ApiBearerAuth()
@Controller('availability')
export class AvailabilityController {
  constructor(
    private readonly userProfileService: UserProfileService,
    private readonly availabilityExpressionService: AvailabilityExpressionService,
    private readonly availabilityTimeslotService: AvailabilityTimeslotService
  ) {}

  @Post('load')
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
    file: Express.Multer.File
  ) {
    const xlsx = new XLSXService();
    xlsx.loadFile(file);

    const sheets = xlsx.getSheets();
    const sheet = sheets[0];
    const rows = xlsx.getDataRows(sheet);
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row['First & Last Name'].trim()) {
        const coachProfiles = await this.userProfileService.findMany({
          where: {
            fullName: {
              contains: row['First & Last Name'].trim(),
              mode: 'insensitive',
            },
          },
        });

        // todo: coaches with the same name need to be processed later.
        if (coachProfiles.length === 1) {
          const coachProfile = coachProfiles[0];
          // Update coach profile.
          let coachingTenure = 0;
          if (row['Title']) {
            // 5:Senior Master Coach, 4:Pro, 3:Senior, 2:Standard, 1:New
            switch (row['Title'].trim()) {
              case 'Senior Master':
                coachingTenure = 5;
              case 'Pro':
                coachingTenure = 4;
              case 'Senior':
                coachingTenure = 3;
              case 'Standard':
                coachingTenure = 2;
              case 'New':
                coachingTenure = 1;
            }
          }
          await this.userProfileService.update({
            where: {id: coachProfile.id},
            data: {
              coachingTenure,
              quotaOfWeek: row['Quota'],
              quotaOfWeekMinPreference:
                row['Select preference for minimum # of classes weekly:'],
              quotaOfWeekMaxPreference:
                row['Select preference for maximum # of classes weekly:'],
            },
          });

          // Create coach availabilities
          for (const key in row) {
            let isTimeKey = false;
            let hour: number = 0;
            let minute: number = 0;

            if (key.endsWith('am')) {
              isTimeKey = true;
              const time = key.replace('am', '');
              const hourAndMinute = time.split(':');
              hour = parseInt(hourAndMinute[0]);
              minute = parseInt(hourAndMinute[1]);
            } else if (key.endsWith('pm')) {
              isTimeKey = true;
              const time = key.replace('pm', '');
              const hourAndMinute = time.split(':');
              hour = parseInt(hourAndMinute[0]);
              minute = parseInt(hourAndMinute[1]);
              if (hour !== 12) {
                hour += 12;
              }
            } else {
            }

            if (isTimeKey) {
              const weekdays = row[key].split(', ');
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
              await this.availabilityExpressionService.create({
                data: {
                  hostUserId: coachProfile.userId,
                  cronExpressionsOfAvailableTimePoints: [
                    `${minute} ${hour} * 10-12 ${stringWeekdays}`,
                  ],
                  dateOfOpening: '2023-10-01T00:00:00.000Z',
                  dateOfClosure: '2023-12-31T00:00:00.000Z',
                  minutesOfDuration: COACH_AVAILABILITY_DURATION_GOOGLE_FORM,
                },
              });
            }
          }
        }
      }
    }
  }

  @Post('publish')
  async publishAvailabilityExpressions() {
    const availabilityExpressions =
      await this.availabilityExpressionService.findMany({
        where: {status: AvailabilityExpressionStatus.EDITING},
      });

    for (let i = 0; i < availabilityExpressions.length; i++) {
      const availabilityExpression = availabilityExpressions[i];

      // [step 1] Parse expression to timeslots.
      const availabilityTimeslots =
        await this.availabilityExpressionService.parse(
          availabilityExpression.id
        );

      // [step 2] Delete and create timeslots.
      await this.availabilityTimeslotService.deleteMany({
        where: {expressionId: availabilityExpression.id},
      });
      await this.availabilityTimeslotService.createMany({
        data: availabilityTimeslots,
      });

      // [step 3] Update expression status.
      await this.availabilityExpressionService.update({
        where: {id: availabilityExpression.id},
        data: {
          status: AvailabilityExpressionStatus.PUBLISHED,
        },
      });
    }
  }
}
