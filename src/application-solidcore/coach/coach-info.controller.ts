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
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {CoachInfoService} from './coach-info.service';
import {GoogleAccountRole} from '@microservices/cloud/saas/google/enum';
import {GoogleDriveService} from '@microservices/cloud/saas/google/google-drive.service';

enum Columns {
  Email1 = 'MBO Email addresss',
  Email2 = 'Namely Email',
  Locations = 'Locations',
  Installment = 'Installment',
  QuotaOfWeek = 'Quota',
  QuotaOfWeekMax = 'Coach Max Class Count',
  PayRate = 'Coach Pay rate as of 12/28/23',
}

@ApiTags('Coach')
@ApiBearerAuth()
@Controller('coaches')
export class CoachInfoController {
  constructor(
    private readonly coachInfoService: CoachInfoService,
    private readonly googleDrive: GoogleDriveService,
    private readonly prisma: PrismaService
  ) {}

  @Post('export-google-sheet')
  async exportCoachInfoToGoogleSheet() {
    const file = await this.coachInfoService.exportSpreadsheet();

    // [step 4] Share the google sheet with area managers.
    // const managers = await this.prisma.user.findMany({
    //   where: {roles: {some: {name: UserRoleName.Manager}}},
    // });
    // for (let i = 0; i < managers.length; i++) {
    //   const manager = managers[i];
    //   if (manager.email && 1) {
    //     await this.googleSpreadsheet.createPermission({
    //       fileId: sheet.id,
    //       email: manager.email,
    //       role: GoogleAccountRole.Writer,
    //     });
    //   }
    // }

    await this.googleDrive.createPermission({
      fileId: file.id,
      email: 'tanlu@inceptionpad.com',
      role: GoogleAccountRole.Writer,
    });
    await this.googleDrive.createPermission({
      fileId: file.id,
      email: 'liyue@inceptionpad.com',
      role: GoogleAccountRole.Writer,
    });
    await this.googleDrive.createPermission({
      fileId: file.id,
      email: 'worldzhy@gmail.com',
      role: GoogleAccountRole.Writer,
    });
  }

  @Post('import-google-sheet')
  async importCoachInfoFromSpreadsheet0() {
    await this.coachInfoService.importSpreadsheet_Index0();
    await this.coachInfoService.importSpreadsheet_Index2();
  }

  @Post('load-xlsx-file')
  @UseInterceptors(FileInterceptor('file'))
  async importCoachInfoFromLocalFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType:
            'text/csv|application/vnd.ms-excel|application/msexcel|application/xls|application/x-xls|application/x-excel|application/x-dos_ms_excel|application/x-ms-excel|application/x-msexcel|application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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
      // [step 1] Get the coach.
      const row = rows[i];
      let email: string;
      if (!row[Columns.Email1] || !row[Columns.Email1].trim()) {
        if (!row[Columns.Email2] || !row[Columns.Email2].trim()) {
          continue;
        } else {
          email = row[Columns.Email2];
        }
      } else {
        email = row[Columns.Email1];
      }

      const coach = await this.prisma.user.findFirst({
        where: {email: {equals: email.trim(), mode: 'insensitive'}},
        select: {
          id: true,
          profile: {select: {fullName: true, eventVenueIds: true}},
        },
      });
      if (!coach) {
        continue;
      }

      // [step 2] Process coach information.
      const coachLocationNames: string[] = [];
      const coachInstallmentNames: string[] = [];
      let payRate: number | undefined = undefined;
      for (const key in row) {
        // 1) Process coach locations if the coach doesn't have locations.
        if (
          key === Columns.Locations &&
          (coach.profile!.eventVenueIds === undefined ||
            coach.profile!.eventVenueIds.length === 0)
        ) {
          row[key].split(';').map((location: string) => {
            location = location.replace(' -', ',').replace(' & ', '&').trim();
            if (!coachLocationNames.includes(location)) {
              coachLocationNames.push(location);
            }
          });
        }

        // 2) Process coach class installments.
        if (key === Columns.Installment) {
          row[key].split(';').map((installment: string) => {
            installment = 'Installment ' + installment.trim();
            if (!coachInstallmentNames.includes(installment)) {
              coachInstallmentNames.push(installment);
            }
          });
        }

        // 3) Process coach pay rate.
        if (key === Columns.PayRate) {
          const arr = row[key].split(' ');
          if (arr.length > 1 && Number.isInteger(parseInt(arr[1]))) {
            payRate = parseInt(arr[1]);
          }
        }
      }

      // [step 3] Overwrite coach locations.
      const venues = await this.prisma.eventVenue.findMany({
        where: {name: {in: coachLocationNames}},
        select: {id: true},
      });
      const coachLocationIds = venues.map(venue => {
        return venue.id;
      });

      // [step 4] Overwrite coach installments.
      const installmentTags = await this.prisma.tag.findMany({
        where: {name: {in: coachInstallmentNames}},
      });
      const installmentTagIds = installmentTags.map(tag => {
        return tag.id;
      });
      const eventTypes = await this.prisma.eventType.findMany({
        where: {
          tagId: {in: installmentTagIds},
        },
      });
      const eventTypeIds = eventTypes.map(eventType => {
        return eventType.id;
      });

      // [step 4] Update coach profile.
      await this.prisma.userSingleProfile.update({
        where: {userId: coach.id},
        data: {
          eventVenueIds:
            coachLocationIds.length > 0 ? coachLocationIds : undefined,
          eventTypeIds: eventTypeIds.length > 0 ? eventTypeIds : undefined,
          quotaOfWeekMin: Number.isInteger(row[Columns.QuotaOfWeek])
            ? row[Columns.QuotaOfWeek]
            : undefined,
          quotaOfWeekMax: Number.isInteger(row[Columns.QuotaOfWeekMax])
            ? row[Columns.QuotaOfWeekMax]
            : undefined,
          eventHostPayRate: payRate,
        },
      });
    }
  }

  // End
}
