/* eslint-disable @typescript-eslint/no-explicit-any */
import {BadRequestException, Injectable} from '@nestjs/common';
import {
  Prisma,
  AsyncPublish,
  AsyncEventStatus,
  EventPublishStatus,
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

    // const publishStatus = await this.getPublishStatus(body);

    // if (publishStatus) {
    //   const cur = _.get(publishStatus, 'asyncPublish.curEventsCnt');
    //   const total = _.get(publishStatus, 'asyncPublish.eventsCnt');

    //   if (!goingon && cur !== total) {
    //     throw new BadRequestException(
    //       `This container has a uncompleted publishment: ${cur}/${total} `
    //     );
    //   }
    // }

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
        isPublished: false,
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
        status: AsyncEventStatus.PENDING,
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
        publishStatus: EventPublishStatus.PENDING,
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

  async removeSchdules(params) {
    console.log('removeSchdules', params);
    // const {asyncPublishId} = params;
    // const asyncPublish = await this.prisma.asyncPublish.findFirstOrThrow({
    //   where: {
    //     id: asyncPublishId,
    //   },
    // });

    // const where = {
    //   id: asyncPublishId,
    // };
    // await this.prisma.asyncPublish.update({
    //   where,
    //   data: {
    //     status: AsyncEventStatus.REMOVING,
    //   },
    // });

    // const {containerId} = asyncPublish;

    // const container = await this.prisma.eventContainer.findFirstOrThrow({
    //   where: {
    //     id: containerId,
    //   },
    //   include: {
    //     venue: true,
    //   },
    // });

    // const {year, month, venue} = container;

    // const studioId = venue.external_studioId || 0;
    // const locationId = venue.external_locationId || 0;

    // const startDateTime = moment()
    //   .year(year)
    //   .month(month - 1)
    //   .startOf('month')
    //   .format('YYYY-MM-DD');
    // const endDateTime = moment()
    //   .year(year)
    //   .month(month - 1)
    //   .endOf('month')
    //   .format('YYYY-MM-DD');

    // const schEndDate = moment().add(2, 'years').endOf('years').toISOString();

    // const schParams = {
    //   page: 1,
    //   pageSize: 1000,
    //   studioId,
    //   locationIds: locationId,
    //   startDateTime,
    //   endDateTime,
    // };

    // const {data} = await this.mindbodyService.getClasses(schParams);

    // await this.prisma.asyncPublish.update({
    //   where,
    //   data: {
    //     oldEvents: data.Classes.length,
    //   },
    // });

    // for (const _class of []) {
    // for (const _class of data.Classes) {
    //   const {ClassScheduleId} = _class;
    //   const schParams = {
    //     studioId,
    //     locationId,
    //     classScheduleIds: ClassScheduleId,
    //     endDate: schEndDate,
    //   };
    //   const schResp = await this.mindbodyService.getClassSchedules(schParams);

    //   const _sch = _.get(schResp, 'data.ClassSchedules[0]');

    //   const rmSchParams = {
    //     studioId,
    //     locationId,
    //     scheduleId: ClassScheduleId,
    //   };

    //   const endDate = moment(_sch.EndDate);
    //   const startDate = moment(_sch.StartDate);

    //   const endOf2023 = moment('2023-12-31').endOf('year');
    //   const endOf2023_string = endOf2023.toISOString();

    //   let resp = {};

    //   const mboLogData: any = {
    //     containerId,
    //     locationId,
    //     studioId,
    //     asyncPublishId,
    //     params: rmSchParams,
    //   };

    //   if (endDate.isAfter(endOf2023) && startDate.isBefore(endOf2023)) {
    //     mboLogData.funcName = 'endClassSchduleById';
    //     resp = await this.mindbodyService.endClassSchduleById(
    //       rmSchParams,
    //       endOf2023_string
    //     );
    //   } else {
    //     mboLogData.funcName = 'endClassFeatureSchduleById';
    //     resp =
    //       await this.mindbodyService.endClassFeatureSchduleById(rmSchParams);
    //   }

    //   mboLogData.resp = resp;
    //   await this.prisma.mboLog.create({data: mboLogData});
    //   // await sleep(1000);
    // }

    // await this.prisma.asyncPublish.update({
    //   where,
    //   data: {
    //     status: AsyncEventStatus.REMOVED,
    //   },
    // });
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
        isPublished: false,
      },
      include: {type: true},
    });

    await this.prisma.event.updateMany({
      data: {
        publishStatus: EventPublishStatus.PENDING,
      },
      where: {
        containerId: container.id,
        year: container.year,
        month: container.month,
        deletedAt: null,
        isPublished: false,
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

    // const where = {
    //   id: asyncPublishId,
    // };

    console.log('addSchduleOne eventId:', eventId);

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

    if (event.isPublished) {
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

    // const resp1 = scToMbService.getResult();
    // console.log(resp1.currentClass);
    // return;
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

    // const asyncPublish2 = await this.prisma.asyncPublish.findFirstOrThrow({
    //   where: {
    //     id: asyncPublishId,
    //   },
    // });

    // const {curEventsCnt, eventsCnt} = asyncPublish2;

    // const data: any = {
    //   curEventsCnt: curEventsCnt + 1,
    // };

    // console.log('curEventsCnt', curEventsCnt);
    // if (eventsCnt === curEventsCnt + 1) {
    //   data.status = AsyncEventStatus.COMPLETED;
    // }

    // await this.prisma.asyncPublish.update({
    //   where,
    //   data,
    // });

    const classScheduleId = _.get(resp, 'mboResp.data.ClassId');
    const mboData = {
      resp: mboResp,
      classScheduleId,
    };
    if (!resp.success) {
      await this.prisma.event.update({
        where: {id: eventId},
        data: {mboData, publishStatus: EventPublishStatus.FAILED},
      });
      return resp;
    }

    // // [step 2] Modify coaches' availability status
    await this.availabilityService.checkinTimeslots(event);

    // // [step 2] Update event status.
    await this.prisma.event.update({
      where: {id: eventId},
      data: {
        isPublished: true,
        mboData,
        publishStatus: EventPublishStatus.COMPLETED,
      },
    });
    return resp;
  }
}
