import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {Prisma, EventChangeLog} from '@prisma/client';
import {EventChangeLogService} from '@microservices/event-scheduling/event-change-log.service';
import {EventService} from '@microservices/event-scheduling/event.service';
import {UserProfileService} from '@microservices/account/user/user-profile.service';

@ApiTags('Event Change Log')
@ApiBearerAuth()
@Controller('event-changelogs')
export class EventChangeLogController {
  constructor(
    private readonly eventChangeLogService: EventChangeLogService,
    private readonly eventService: EventService,
    private readonly userProfileService: UserProfileService
  ) {}

  @Post('')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          description: 'a note',
          userId: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
          containerId: 1,
        },
      },
    },
  })
  async createEventChangeLog(
    @Body()
    body: Prisma.EventChangeLogUncheckedCreateInput
  ): Promise<EventChangeLog> {
    return await this.eventChangeLogService.create({
      data: body,
    });
  }

  @Get('')
  async getEventChangeLogs(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('containerId') containerId: number
  ) {
    const result = await this.eventService.findManyInManyPages(
      {page, pageSize},
      {
        where: {
          containerId,
          changeLogs: {some: {eventContainerId: containerId}},
        },
        include: {
          type: {select: {name: true}},
          changeLogs: {select: {description: true}},
        },
      }
    );

    // Get all the coaches information
    const coachIds = result.records
      .map(event => {
        return event.hostUserId;
      })
      .filter(coachId => coachId !== null) as string[];
    const coachProfiles = await this.userProfileService.findMany({
      where: {userId: {in: coachIds}},
      select: {userId: true, fullName: true, coachingTenure: true},
    });
    const coachProfilesMapping = coachProfiles.reduce(
      (obj, item) => ({
        ...obj,
        [item.userId]: item,
      }),
      {}
    );

    for (let i = 0; i < result.records.length; i++) {
      const event = result.records[i];
      // Attach coach information
      if (event.hostUserId) {
        event['hostUser'] = coachProfilesMapping[event.hostUserId];
      } else {
        event['hostUser'] = {};
      }
    }

    return result;
  }

  @Patch(':noteId')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          description: 'a note',
          userId: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
          containerId: 1,
        },
      },
    },
  })
  async updateEventChangeLog(
    @Param('noteId') noteId: number,
    @Body()
    body: Prisma.EventChangeLogUncheckedUpdateInput
  ): Promise<EventChangeLog> {
    return await this.eventChangeLogService.update({
      where: {id: noteId},
      data: body,
    });
  }

  @Delete(':noteId')
  async deleteEventChangeLog(
    @Param('noteId') noteId: number
  ): Promise<EventChangeLog> {
    return await this.eventChangeLogService.delete({
      where: {id: noteId},
    });
  }

  /* End */
}
