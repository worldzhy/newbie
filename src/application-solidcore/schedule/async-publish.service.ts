/* eslint-disable @typescript-eslint/no-explicit-any */
import {BadRequestException, Injectable} from '@nestjs/common';
import {
  Prisma,
  AsyncPublish,
  AsyncEventStatus,
  EventStatus,
} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {EventEmitter2} from '@nestjs/event-emitter';
import {MindbodyService} from '../mindbody/mindbody.service';
import * as _ from 'lodash';
import {ScToMbService2} from '../mindbody/scToMb2.service';
import {sleep} from '../mindbody/util';
import {RawDataCoachService} from '../raw-data/raw-data-coach.service';
import {AvailabilityService} from '@microservices/event-scheduling/availability.service';

@Injectable()
export class AsyncPublishService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly availabilityService: AvailabilityService,
    private readonly eventEmitter: EventEmitter2,
    private readonly mindbodyService: MindbodyService,
    private readonly rawDataCoachService: RawDataCoachService
  ) {}

  async findUniqueOrThrow(
    args: Prisma.AsyncPublishFindUniqueOrThrowArgs
  ): Promise<AsyncPublish> {
    return await this.prisma.asyncPublish.findUniqueOrThrow(args);
  }

  async findMany(
    args: Prisma.AsyncPublishFindManyArgs
  ): Promise<AsyncPublish[]> {
    return await this.prisma.asyncPublish.findMany(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.AsyncPublishFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.AsyncPublish,
      pagination,
      findManyArgs,
    });
  }

  async create(args: Prisma.AsyncPublishCreateArgs): Promise<AsyncPublish> {
    return await this.prisma.asyncPublish.create(args);
  }

  async createMany(
    args: Prisma.AsyncPublishCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.asyncPublish.createMany(args);
  }

  async update(args: Prisma.AsyncPublishUpdateArgs): Promise<AsyncPublish> {
    return await this.prisma.asyncPublish.update(args);
  }

  async updateMany(
    args: Prisma.AsyncPublishUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.asyncPublish.updateMany(args);
  }

  async delete(args: Prisma.AsyncPublishDeleteArgs): Promise<AsyncPublish> {
    return await this.prisma.asyncPublish.delete(args);
  }

  async deleteMany(
    args: Prisma.AsyncPublishDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.asyncPublish.deleteMany(args);
  }

  async count(args: Prisma.AsyncPublishCountArgs): Promise<number> {
    return await this.prisma.asyncPublish.count(args);
  }

  async publishContainer(body) {
    const {containerId} = body;

    const container = await this.prisma.eventContainer.findFirstOrThrow({
      where: {
        id: containerId,
      },
      include: {
        venue: true,
      },
    });

    const unPublishedEvent = await this.prisma.event.count({
      where: {
        containerId: container.id,
        year: container.year,
        month: container.month,
        deletedAt: null,
      },
    });

    console.log('unPublishedEvent', unPublishedEvent);

    const eventsCnt = await this.prisma.event.count({
      where: {
        containerId: container.id,
        year: container.year,
        month: container.month,
        deletedAt: null,
      },
    });

    if (!unPublishedEvent) {
      throw new BadRequestException('No unpublished events was not found.');
    }

    let asyncPublish = await this.prisma.asyncPublish.findFirst({
      where: {
        containerId,
      },
      orderBy: {
        id: 'desc',
      },
    });

    if (!asyncPublish) {
      asyncPublish = await this.prisma.asyncPublish.create({
        data: {
          containerId,
          eventsCnt,
        },
      });
    }

    const where = {
      id: asyncPublish.id,
    };

    // clear moblogs
    // await this.prisma.mboLog.deleteMany({
    //   where,
    // });

    await this.prisma.asyncPublish.update({
      where,
      data: {
        status: AsyncEventStatus.PUBLISHING,
        eventsCnt,
      },
    });

    // const bacthLimit = 30;
    // const groupLimit = 6;

    // const timestamp = moment().valueOf();
    // const MessageGroupId = `${asyncPublish.id}-remove-${timestamp}`;
    // const MessageDeduplicationId = `${asyncPublish.id}-remove-${timestamp}`;

    // const queueUrl = this.configService.get(
    //   'toolkit.aws.sqs.publish_remove_queue'
    // );
    // // console.log('queueUrl', queueUrl);

    // const sqsResp = await this.sqsService.sendMessage({
    //   queueUrl,
    //   MessageGroupId,
    //   MessageDeduplicationId,
    //   body: {
    //     asyncPublishId: asyncPublish.id,
    //   },
    // });

    // console.log('sqsResp', sqsResp);
    this.eventEmitter.emit('schdules.remove', {
      asyncPublishId: asyncPublish.id,
    });

    return {
      success: true,
    };
  }

  async getPublishStatus(body) {
    const {containerId} = body;

    const resp: any = {
      asyncPublish: null,
    };
    const existedPublish = await this.prisma.asyncPublish.findFirst({
      where: {
        containerId,
      },
      orderBy: {
        id: 'desc',
      },
    });
    if (!existedPublish) {
      return resp;
    }

    const pendingEvents = await this.prisma.event.count({
      where: {
        containerId,
        deletedAt: null,
        status: EventStatus.PUBLISHING,
      },
    });

    const eventsCnt = await this.prisma.event.count({
      where: {
        containerId,
        deletedAt: null,
      },
    });

    existedPublish.eventsCnt = eventsCnt;
    existedPublish.curEventsCnt = eventsCnt - pendingEvents;

    resp.asyncPublish = existedPublish;
    return resp;
  }

  async removeSchdules(params: any) {
    this.addSchdules(params);
  }

  async addSchdules(params) {
    console.log('addSchdules');
    const {asyncPublishId} = params;

    const where = {
      id: asyncPublishId,
    };

    const asyncPublish = await this.prisma.asyncPublish.findFirstOrThrow({
      where: {
        id: asyncPublishId,
      },
    });

    const {containerId} = asyncPublish;

    const container = await this.prisma.eventContainer.findFirstOrThrow({
      where: {
        id: containerId,
      },
      include: {
        venue: true,
      },
    });

    const events = await this.prisma.event.findMany({
      where: {
        containerId: container.id,
        year: container.year,
        month: container.month,
        deletedAt: null,
      },
      include: {type: true},
    });

    await this.prisma.event.updateMany({
      data: {
        status: EventStatus.PUBLISHING,
      },
      where: {
        containerId: container.id,
        year: container.year,
        month: container.month,
        deletedAt: null,
      },
    });

    await this.prisma.asyncPublish.update({
      where,
      data: {
        status: AsyncEventStatus.PUBLISHING,
      },
    });

    for (const e of events) {
      this.eventEmitter.emit('schdules.addOne', {
        eventId: e.id,
        asyncPublishId: asyncPublish.id,
      });
      await sleep(1000);
    }

    await this.prisma.asyncPublish.update({
      where,
      data: {
        status: AsyncEventStatus.COMPLETED,
      },
    });
  }

  async addSchduleOne(payload) {
    const {eventId, asyncPublishId} = payload;

    const asyncPublish = await this.prisma.asyncPublish.findFirstOrThrow({
      where: {
        id: asyncPublishId,
      },
    });

    const {containerId} = asyncPublish;

    await this.prisma.mboLog.deleteMany({
      where: {
        containerId,
        eventId,
      },
    });

    const event = await this.prisma.event.findUniqueOrThrow({
      where: {id: eventId},
      include: {type: true, venue: true, changeLogs: true},
    });

    if (event.status === EventStatus.PUBLISHED) {
      throw new BadRequestException('This event is already published.');
    }

    const scToMbService = new ScToMbService2(
      this.prisma,
      this.mindbodyService,
      this.rawDataCoachService
    );

    const {_event, _body} = await scToMbService.parseBodyEvent({
      body: {},
      event,
    });
    await scToMbService.eventCheck(_event, _body);
    await scToMbService.eventPublish();
    const resp = scToMbService.getResult();
    const mboResp = scToMbService.getMboResult();

    const mboLogData: any = {
      containerId,
      studioId: scToMbService.studioId,
      locationId: scToMbService.locationId,
      asyncPublishId,
      params: {},
      funcName: 'eventPublish',
      eventId,
      resp: mboResp,
    };
    await this.prisma.mboLog.create({data: mboLogData});

    const classScheduleId = _.get(resp, 'mboResp.data.ClassId');
    const mboData = {
      resp: mboResp,
      classScheduleId,
    };
    if (!resp.success) {
      await this.prisma.event.update({
        where: {id: eventId},
        data: {mboData, status: EventStatus.EDITING},
      });
      return resp;
    }

    // [step 2] Modify coaches' availability status
    await this.availabilityService.checkinTimeslots(event);

    // [step 2] Update event status.
    await this.prisma.event.update({
      where: {id: eventId},
      data: {
        mboData,
        status: EventStatus.PUBLISHED,
      },
    });
    return resp;
  }
}
