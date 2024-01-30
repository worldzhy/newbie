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
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {GoogleSheetService} from '@microservices/googleapis/drive/sheet.service';
import {GoogleAccountRole} from '@microservices/googleapis/enum';
import {Prisma} from '@prisma/client';

@ApiTags('Coach')
@ApiBearerAuth()
@Controller('coaches')
export class CoachInfoUploadController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly googleSheetService: GoogleSheetService
  ) {}

  @Post('export-google-sheet')
  async exportGoogleSheet() {
    const spreadsheetId = await this.googleSheetService.create({
      name: 'Coach Info',
      headings: ['Email', 'First name', 'Middle name', 'Last name'],
    });
    const rows: any[][] = [];
    const users = await this.prisma.user.findMany({include: {profile: true}});

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      rows.push([
        user.id,
        user.email,
        user.profile?.firstName,
        user.profile?.middleName,
        user.profile?.lastName,
        user.profile?.coachingTenure,
        user.profile?.quotaOfWeek,
        user.profile?.quotaOfWeekMinPreference,
        user.profile?.quotaOfWeekMaxPreference,
      ]);
    }

    await this.googleSheetService.appendRows({
      spreadsheetId,
      data: rows,
    });

    await this.googleSheetService.share({
      fileId: spreadsheetId,
      gmail: 'worldzhy@gmail.com',
      role: GoogleAccountRole.Writer,
    });

    return spreadsheetId;
  }

  @Post('import-google-sheet')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Import',
        value: {url: ''},
      },
    },
  })
  async importGoogleSheet(@Body() body: {url: string}) {
    const users: Prisma.UserUpdateArgs[] = [];
    const fileId = body.url.split('/d/')[1].split('/')[0];
    const rows = await this.googleSheetService.getRows({
      fileId: fileId,
    });

    if (rows && rows.length > 1) {
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        users.push({
          where: {email: row[0]},
          data: {
            profile: {
              update: {
                quotaOfWeek: row[1],
                quotaOfWeekMinPreference: row[2],
                quotaOfWeekMaxPreference: row[3],
              },
            },
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
      if (!row['Email'] || !row['Email'].trim()) {
        continue;
      }

      const coach = await this.prisma.user.findUnique({
        where: {email: row['Email'].trim().toLowerCase()},
        select: {id: true, profile: {select: {fullName: true}}},
      });
      if (!coach) {
        continue;
      }

      // [step 2] Process coach information.
      const coachLocationNames: string[] = [];
      const coachInstallmentNames: string[] = [];
      for (const key in row) {
        // 1) Process coach locations.
        if (key.startsWith('Locations')) {
          row[key].split(';').map((location: string) => {
            location = location.replace(' -', ',').replace(' & ', '&').trim();
            if (!coachLocationNames.includes(location)) {
              coachLocationNames.push(location);
            }
          });
        }

        // 2) Process coach class installments.
        if (key.startsWith('Installments')) {
          row[key].split(';').map((installment: string) => {
            installment = 'Installment ' + installment.trim();
            if (!coachInstallmentNames.includes(installment)) {
              coachInstallmentNames.push(installment);
            }
          });
        }
      }

      // [step 3] Overwrite coach locations and installments.
      const venues = await this.prisma.eventVenue.findMany({
        where: {name: {in: coachLocationNames}},
        select: {id: true},
      });
      const coachLocationIds = venues.map(venue => {
        return venue.id;
      });
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
          eventVenueIds: coachLocationIds,
          eventTypeIds: eventTypeIds,
          quotaOfWeek: row['Quota'],
        },
      });
    }
  }

  // End
}
