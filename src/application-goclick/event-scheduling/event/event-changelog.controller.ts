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
import {PrismaService} from '@toolkit/prisma/prisma.service';

@ApiTags('Event Scheduling / Event Change Log')
@ApiBearerAuth()
@Controller('event-changelogs')
export class EventChangeLogController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          description: 'a change log',
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
    return await this.prisma.eventChangeLog.create({
      data: body,
    });
  }

  @Get('')
  async getEventChangeLogs(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('containerId') containerId: number
  ) {
    const result = await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.Event,
      pagination: {page, pageSize},
      findManyArgs: {
        where: {
          containerId,
          changeLogs: {some: {eventContainerId: containerId}},
        },
        include: {
          type: {select: {name: true}},
          changeLogs: {select: {description: true}},
        },
      },
    });

    // Get all the coaches information
    const coachIds = result.records
      .map(event => {
        return event.hostUserId;
      })
      .filter(coachId => coachId !== null) as string[];
    const coachProfiles = await this.prisma.userSingleProfile.findMany({
      where: {userId: {in: coachIds}},
      select: {userId: true, fullName: true, eventHostTitle: true},
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

  @Patch(':changeLogId')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          description: 'a change log',
          userId: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
          containerId: 1,
        },
      },
    },
  })
  async updateEventChangeLog(
    @Param('changeLogId') changeLogId: number,
    @Body()
    body: Prisma.EventChangeLogUncheckedUpdateInput
  ): Promise<EventChangeLog> {
    return await this.prisma.eventChangeLog.update({
      where: {id: changeLogId},
      data: body,
    });
  }

  @Delete(':changeLogId')
  async deleteEventChangeLog(
    @Param('changeLogId') changeLogId: number
  ): Promise<EventChangeLog> {
    return await this.prisma.eventChangeLog.delete({
      where: {id: changeLogId},
    });
  }

  /* End */
}
