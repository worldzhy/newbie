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
import {UserService} from '@microservices/account/user/user.service';
import {UserProfileService} from '@microservices/account/user/user-profile.service';
import {EventTypeService} from '@microservices/event-scheduling/event-type.service';
import {EventVenueService} from '@microservices/event-scheduling/event-venue.service';
import {TagService} from '@microservices/tag/tag.service';

@ApiTags('Coach')
@ApiBearerAuth()
@Controller('coaches')
export class CoachInfoUploadController {
  constructor(
    private readonly userService: UserService,
    private readonly userProfileService: UserProfileService,
    private readonly eventTypeService: EventTypeService,
    private readonly eventVenueService: EventVenueService,
    private readonly tagService: TagService
  ) {}

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

      const coach = await this.userService.findUnique({
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
      const venues = await this.eventVenueService.findMany({
        where: {name: {in: coachLocationNames}},
        select: {id: true},
      });
      const coachLocationIds = venues.map(venue => {
        return venue.id;
      });
      const installmentTags = await this.tagService.findMany({
        where: {name: {in: coachInstallmentNames}},
      });
      const installmentTagIds = installmentTags.map(tag => {
        return tag.id;
      });

      const eventTypes = await this.eventTypeService.findMany({
        where: {
          tagId: {in: installmentTagIds},
        },
      });
      const eventTypeIds = eventTypes.map(eventType => {
        return eventType.id;
      });

      // [step 4] Update coach profile.
      await this.userProfileService.update({
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
