import {Injectable} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {
  alphabet2number,
  extractNumbersFromString,
} from '@toolkit/utilities/common.util';
import {GoogleFile, Prisma, UserStatus} from '@prisma/client';
import {ConfigService} from '@nestjs/config';
import {GoogleDriveService} from '@microservices/storage/google-drive/google-drive.service';
import {GoogleSheetService} from '@microservices/google/google-sheet.service';
import {verifyEmail, verifyUuid} from '@toolkit/validators/user.validator';

const EXPORT_SPREADSHEET_NAME = 'Solidcore Coach List';
const EXPORT_SPREADSHEET_SHEET_TITLE = 'Sheet1';
const IMPORT_SPREADSHEET_ID = '1PTYQglny7HdU6EYLq27WiAf1icy3zODv3M03nwFZkVU';
const IMPORT_SPREADSHEET_ID_QA = '19J1A47AV38KHGKApj29jfaSYnncO8fXr8Atty51FmYc';
const IMPORT_SPREADSHEET_SHEET_0_TITLE = 'Coach Info';
const IMPORT_SPREADSHEET_SHEET_2_TITLE = 'Inception Pad import';

const EXPORT_SHEET_HEADINGS = [
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
  'Status',
];

@Injectable()
export class CoachInfoService {
  protected exportedSheetName: string;
  protected importedSpreadsheetId: string;
  constructor(
    private readonly googleDrive: GoogleDriveService,
    private readonly googleSheet: GoogleSheetService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {
    if ('production' === this.configService.get('server.environment')) {
      this.exportedSheetName = '[PROD] ' + EXPORT_SPREADSHEET_NAME;
      this.importedSpreadsheetId = IMPORT_SPREADSHEET_ID;
    } else {
      this.exportedSheetName = '[QA] ' + EXPORT_SPREADSHEET_NAME;
      this.importedSpreadsheetId = IMPORT_SPREADSHEET_ID_QA;
    }
  }

  async exportSpreadsheet() {
    // [step 1] Get the google spreadsheet.
    let spreadsheet: GoogleFile | null;

    spreadsheet = await this.googleDrive.getFile(this.exportedSheetName);
    if (!spreadsheet) {
      spreadsheet = await this.googleDrive.createSheet({
        name: this.exportedSheetName,
      });
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
        profile.quotaOfWeekMin,
        profile.quotaOfWeekMax,
        profile.eventHostPayRate,
        user.id,
        user.status,
      ]);
    }

    // [step 3] Write data into the spreadsheet.
    await this.googleSheet.clearSheet({
      fileId: spreadsheet.id,
      sheetTitle: EXPORT_SPREADSHEET_SHEET_TITLE,
    });
    await this.googleSheet.updateHeadings({
      fileId: spreadsheet.id,
      sheetTitle: EXPORT_SPREADSHEET_SHEET_TITLE,
      headings: EXPORT_SHEET_HEADINGS,
    });
    await this.googleSheet.appendRows({
      fileId: spreadsheet.id,
      sheetTitle: EXPORT_SPREADSHEET_SHEET_TITLE,
      data: sheetData,
    });
    await this.googleSheet.resizeColumms({
      fileId: spreadsheet.id,
      startIndex: 0,
      endIndex: EXPORT_SHEET_HEADINGS.length - 1,
    });

    return spreadsheet;
  }

  async importSpreadsheet_Index0() {
    const rows = await this.googleSheet.getRows({
      fileId: this.importedSpreadsheetId,
      sheetTitle: IMPORT_SPREADSHEET_SHEET_0_TITLE,
    });

    if (rows && rows.length > 1) {
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];

        // Process pay rate, like 'Rate 3 - Solidcore Standard', 'Hourly'
        const payRateString = row[alphabet2number('O') - 1];
        const payRateNumbers =
          typeof payRateString === 'string'
            ? extractNumbersFromString(payRateString)
            : [];
        let where: Prisma.UserWhereUniqueInput;
        if (
          typeof row[alphabet2number('P') - 1] === 'string' &&
          verifyUuid(row[alphabet2number('P') - 1])
        ) {
          where = {id: row[alphabet2number('P') - 1]};
        } else if (
          typeof row[alphabet2number('J') - 1] === 'string' &&
          verifyEmail(row[alphabet2number('J') - 1])
        ) {
          where = {email: row[alphabet2number('J') - 1]};
        } else {
          continue;
        }

        try {
          await this.prisma.user.update({
            where,
            data: {
              profile: {
                update: {
                  eventHostTitle: row[alphabet2number('N') - 1],
                  quotaOfWeekMin: row[alphabet2number('X') - 1]
                    ? parseInt(row[alphabet2number('X') - 1])
                    : undefined,
                  quotaOfWeekMax: row[alphabet2number('Z') - 1]
                    ? parseInt(row[alphabet2number('Z') - 1])
                    : undefined,
                  eventHostPayRate:
                    payRateNumbers.length > 0 ? payRateNumbers[0] : undefined,
                },
              },
            },
          });
        } catch (error) {}
      }
    }
  }

  async importSpreadsheet_Index2() {
    const rows = await this.googleSheet.getRows({
      fileId: this.importedSpreadsheetId,
      sheetTitle: IMPORT_SPREADSHEET_SHEET_2_TITLE,
    });
    if (rows && rows.length > 1) {
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];

        let where: Prisma.UserWhereUniqueInput;
        if (
          typeof row[alphabet2number('K') - 1] === 'string' &&
          verifyUuid(row[alphabet2number('K') - 1])
        ) {
          where = {id: row[alphabet2number('K') - 1]};
        } else if (
          typeof row[alphabet2number('B') - 1] === 'string' &&
          verifyEmail(row[alphabet2number('B') - 1])
        ) {
          where = {email: row[alphabet2number('B') - 1]};
        } else {
          continue;
        }

        try {
          await this.prisma.user.update({
            where,
            data: {
              status:
                row[alphabet2number('N') - 1] === 'active coach'
                  ? UserStatus.ACTIVE
                  : row[alphabet2number('N') - 1] === 'not active'
                    ? UserStatus.INACTIVE
                    : undefined,
              profile: {
                update: {
                  firstName: row[alphabet2number('C') - 1],
                  middleName: row[alphabet2number('D') - 1],
                  lastName: row[alphabet2number('E') - 1],
                  quotaOfWeekMin: row[alphabet2number('H') - 1]
                    ? parseInt(row[alphabet2number('H') - 1])
                    : undefined,
                  quotaOfWeekMax: row[alphabet2number('I') - 1]
                    ? parseInt(row[alphabet2number('I') - 1])
                    : undefined,
                },
              },
            },
          });
        } catch (error) {}
      }
    }
  }

  /* End */
}
