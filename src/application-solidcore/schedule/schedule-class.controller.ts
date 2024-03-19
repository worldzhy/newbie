import {
  Controller,
  Delete,
  Patch,
  Post,
  Body,
  Param,
  BadRequestException,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {Event, EventChangeLogType, EventStatus} from '@prisma/client';
import {EventService} from '@microservices/event-scheduling/event.service';
import {AsyncPublishService} from './async-publish.service';
import {OnEvent} from '@nestjs/event-emitter';
import {MindbodyService} from '../mindbody/mindbody.service';
import * as _ from 'lodash';
import {ScToMbService2} from '../mindbody/scToMb2.service';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {RawDataCoachService} from '../raw-data/raw-data-coach.service';

@ApiTags('Event')
@ApiBearerAuth()
@Controller('events')
export class EventController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventService: EventService,
    private readonly asyncPublishService: AsyncPublishService,
    private readonly mindbodyService: MindbodyService,
    private readonly rawDataCoachService: RawDataCoachService
  ) {}

  @Patch(':eventId/lock')
  @ApiBody({
    description: 'Lock the event.',
    examples: {
      a: {
        summary: '1. Lock',
        value: {
          isLocked: true,
        },
      },
      b: {
        summary: '1. Unlock',
        value: {
          isLocked: false,
        },
      },
    },
  })
  async lockEvent(
    @Param('eventId') eventId: number,
    @Body() body: {isLocked: boolean}
  ): Promise<Event> {
    if (body.isLocked) {
      return await this.prisma.event.update({
        where: {id: eventId},
        data: {status: EventStatus.LOCKED},
      });
    } else {
      return await this.prisma.event.update({
        where: {id: eventId},
        data: {status: EventStatus.EDITING},
      });
    }
  }

  @Delete(':eventId')
  async deleteEvent(@Param('eventId') eventId: number): Promise<Event> {
    // [step 1] Get the event.
    const event = await this.prisma.event.findUniqueOrThrow({
      where: {id: eventId},
      include: {type: true},
    });

    if (event.status === EventStatus.PUBLISHED) {
      const deleteMbo = await this.mindbodyService.deleteFromMboById(event.id);
      console.log('deleteMbo', deleteMbo);
      if (!deleteMbo) {
        throw new BadRequestException('Delete mbo class failed');
      }
    }
    // [step 2] Delete the event.
    await this.prisma.event.delete({
      where: {id: eventId},
      include: {type: true},
    });

    // [step 3] Note the deletion.
    await this.prisma.eventChangeLog.create({
      data: {
        type: EventChangeLogType.USER,
        description:
          'Remove class: ' +
          event['type'].name +
          ' at ' +
          event.datetimeOfStart,
        eventContainerId: event.containerId,
        eventId: eventId,
      },
    });

    return event;
  }

  @Patch(':eventId/publish')
  async publishEvent(@Param('eventId') eventId: number, @Body() body) {
    const event = await this.prisma.event.findUniqueOrThrow({
      where: {id: eventId},
      include: {type: true, venue: true, changeLogs: true},
    });

    // if (event.isPublished) {
    //   throw new BadRequestException('This event is already published.');
    // }

    const {checkResult} = body;

    const scToMbService = new ScToMbService2(
      this.prisma,
      this.mindbodyService,
      this.rawDataCoachService
    );

    if (checkResult) {
      scToMbService.setCheckResult(checkResult);
    } else {
      const {_event, _body} = await scToMbService.parseBodyEvent({
        body,
        event,
      });
      await scToMbService.eventCheck(_event, _body);
    }
    if (event.status === EventStatus.PUBLISHED) {
      await scToMbService.eventUpdate(event);
    } else {
      await scToMbService.eventPublish();
    }
    const resp = scToMbService.getResult();
    const mboResp = scToMbService.getMboResult();

    const classScheduleId = _.get(resp, 'mboResp.data.ClassId');
    const mboData = {
      resp: mboResp,
      classScheduleId,
    };

    const updateData: any = {
      mboData,
    };

    if (event.status != EventStatus.PUBLISHED) {
      if (resp.success) {
        updateData.publishStatus = EventStatus.PUBLISHED;
        updateData.isPublished = true;
      } else {
        updateData.publishStatus = EventStatus.EDITING;
      }
      await this.prisma.event.update({
        where: {id: eventId},
        data: updateData,
      });
    } else {
      if (resp.success) {
        updateData.publishStatus = EventStatus.PUBLISHED;
        updateData.isPublished = true;
        await this.eventService.updateEvent(eventId, body.event);
      }
    }

    return resp;
  }

  @Patch(':eventId/publishCheck')
  async publishCheck(@Param('eventId') eventId: number, @Body() body) {
    const event = await this.prisma.event.findUniqueOrThrow({
      where: {id: eventId},
      include: {type: true, venue: true},
    });

    const scToMbService = new ScToMbService2(
      this.prisma,
      this.mindbodyService,
      this.rawDataCoachService
    );

    const {_event, _body} = await scToMbService.parseBodyEvent({
      body,
      event,
    });
    await scToMbService.eventCheck(_event, _body);
    const resp = scToMbService.getResult();

    return resp;
  }

  @Post('publishContainer')
  async publishContainer(@Body() body) {
    return this.asyncPublishService.publishContainer(body);
  }

  @Post('getPublishStatus')
  async getPublishStatus(@Body() body) {
    return this.asyncPublishService.getPublishStatus(body);
  }

  // @Post('publishContainerHandle')
  // async publishContainerHandle(@Body() body) {
  //   return this.asyncPublishService.publishContainerHandle(body);
  // }

  @OnEvent('schdules.addOne')
  async addScduleEvent(payload) {
    await this.asyncPublishService.addSchduleOne(payload);
  }

  @OnEvent('schdules.remove')
  async removeScduleEvent(payload) {
    await this.asyncPublishService.removeSchdules(payload);
  }

  /* End */
}
