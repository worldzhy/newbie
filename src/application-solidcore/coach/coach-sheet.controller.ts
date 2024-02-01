import {
  Controller,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {FileInterceptor} from '@nestjs/platform-express';
import {ConfigService} from '@nestjs/config';
import {GoogleFile} from '@prisma/client';
import {Express} from 'express';
import {XLSXService} from '@toolkit/xlsx/xlsx.service';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {GoogleSheetService} from '@microservices/googleapis/drive/sheet.service';
import {GoogleAccountRole} from '@microservices/googleapis/enum';
import {UserRoleName} from './enum';

enum Columns {
  Email1 = 'MBO Email addresss',
  Email2 = 'Namely Email',
  Locations = 'Locations',
  Installment = 'Installment',
  QuotaOfWeek = 'Quota',
  QuotaOfWeekMax = 'Coach Max Class Count',
  PayRate = 'Coach Pay rate as of 12/28/23',
}

const COACH_SHEET_NAME = 'Solidcore Coach List';
const COACH_SHEET_HEADINGS = [
  'Email',
  'First Name',
  'Middle Name',
  'Last Name',
  'Quota Of Week',
  'Max Quota Of Week',
  'Min Preferred Quota',
  'Max Preferred Quota',
  'Pay Rate',
  'ID',
];

@ApiTags('Coach')
@ApiBearerAuth()
@Controller('coaches')
export class CoachInfoUploadController {
  constructor(
    private readonly googleSheet: GoogleSheetService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  @Post('export-google-sheet')
  async exportGoogleSheet() {
    // [step 1] Get the google sheet.
    let sheet: GoogleFile | null;
    let sheetName: string;
    if ('production' === this.configService.get('server.environment')) {
      sheetName = '[PROD] ' + COACH_SHEET_NAME;
    } else {
      sheetName = '[QA] ' + COACH_SHEET_NAME;
    }

    sheet = await this.googleSheet.findOne(sheetName);
    if (!sheet) {
      sheet = await this.googleSheet.create({name: sheetName});
    }

    // [step 2] Prepare data.
    const sheetData: any[][] = [];
    const users = await this.prisma.user.findMany({include: {profile: true}});
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const profile = user.profile;
      if (!profile) {
        continue;
      }

      sheetData.push([
        user.email,
        profile.firstName,
        profile.middleName,
        profile.lastName,
        profile.quotaOfWeek,
        profile.quotaOfWeekMax,
        profile.quotaOfWeekMinPreference,
        profile.quotaOfWeekMaxPreference,
        profile.payRate,
        user.id,
      ]);
    }

    // [step 3] Write data into the sheet.
    await this.googleSheet.clearSheet(sheet.id);
    await this.googleSheet.updateHeadings({
      fileId: sheet.id,
      headings: COACH_SHEET_HEADINGS,
    });
    await this.googleSheet.appendRows({fileId: sheet.id, data: sheetData});
    await this.googleSheet.resizeColumms({
      fileId: sheet.id,
      startIndex: 0,
      endIndex: 9,
    });

    // [step 4] Share the google sheet with area managers.
    const managers = await this.prisma.user.findMany({
      where: {roles: {some: {name: UserRoleName.Manager}}},
    });
    for (let i = 0; i < managers.length; i++) {
      const manager = managers[i];
      if (manager.email && 1) {
        await this.googleSheet.share({
          fileId: sheet.id,
          gmail: manager.email,
          role: GoogleAccountRole.Writer,
        });
      }
    }
  }

  @Post('import-google-sheet')
  async importGoogleSheet() {
    let sheetName: string;
    if ('production' === this.configService.get('server.environment')) {
      sheetName = '[PROD] ' + COACH_SHEET_NAME;
    } else {
      sheetName = '[QA] ' + COACH_SHEET_NAME;
    }

    let sheet = await this.googleSheet.findOne(sheetName);
    if (!sheet) {
      return;
    }

    const rows = await this.googleSheet.getRows({fileId: sheet.id});
    if (rows && rows.length > 1) {
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        await this.prisma.userProfile.update({
          where: {userId: row[9]},
          data: {
            firstName: row[1],
            middleName: row[2],
            lastName: row[3],
            quotaOfWeek: row[4] ? parseInt(row[4]) : undefined,
            quotaOfWeekMax: row[5] ? parseInt(row[5]) : undefined,
            quotaOfWeekMinPreference: row[6] ? parseInt(row[6]) : undefined,
            quotaOfWeekMaxPreference: row[7] ? parseInt(row[7]) : undefined,
            payRate: row[8] ? parseInt(row[8]) : undefined,
          },
        });
      }
    }
  }

  @Post('load-xlsx-file')
  @UseInterceptors(FileInterceptor('file'))
  async loadAvailabilityFile(
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
          coach.profile &&
          (coach.profile.eventVenueIds === undefined ||
            coach.profile.eventVenueIds.length === 0)
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
      await this.prisma.userProfile.update({
        where: {userId: coach.id},
        data: {
          eventVenueIds:
            coachLocationIds.length > 0 ? coachLocationIds : undefined,
          eventTypeIds: eventTypeIds.length > 0 ? eventTypeIds : undefined,
          quotaOfWeek: Number.isInteger(row[Columns.QuotaOfWeek])
            ? row[Columns.QuotaOfWeek]
            : undefined,
          quotaOfWeekMax: Number.isInteger(row[Columns.QuotaOfWeekMax])
            ? row[Columns.QuotaOfWeekMax]
            : undefined,
          payRate: payRate,
        },
      });
    }
  }

  // End
}
