import {Controller, Patch, Post, Body, Param} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {Event, EventStatus} from '@prisma/client';
import {} from '@microservices/event-scheduling/event.service';
import {AsyncPublishService} from './async-publish.service';
import {OnEvent} from '@nestjs/event-emitter';
import {MindbodyService} from '../mindbody/mindbody.service';
import * as _ from 'lodash';
import {ScToMbService2} from '../mindbody/scToMb2.service';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {RawDataCoachService} from '../raw-data/raw-data-coach.service';

@ApiTags('Solidcore / Event')
@ApiBearerAuth()
@Controller('events')
export class EventController {
  constructor(
    private readonly prisma: PrismaService,
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
