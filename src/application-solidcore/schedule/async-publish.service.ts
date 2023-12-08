/* eslint-disable @typescript-eslint/no-explicit-any */
import {BadRequestException, Injectable} from '@nestjs/common';
import {Prisma, AsyncPublish, AsyncEventStatus} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {EventEmitter2} from '@nestjs/event-emitter';
import {ScToMbService} from 'src/application-solidcore/mindbody/scToMb.service';
import {AvailabilityTimeslotService} from '../../microservices/event-scheduling/availability-timeslot.service';
import {MindbodyService} from 'src/application-solidcore/mindbody/mindbody.service';
import * as moment from 'moment';
import * as _ from 'lodash';

@Injectable()
export class AsyncPublishService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly scToMbService: ScToMbService,
    private readonly availabilityTimeslotService: AvailabilityTimeslotService,
    private readonly mindbodyService: MindbodyService
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

    const existedPublish = await this.prisma.asyncPublish.count({
      where: {
        containerId,
        status: {
          not: {
            in: [AsyncEventStatus.COMPLETED, AsyncEventStatus.FAILED],
          },
        },
      },
    });

    if (existedPublish) {
      throw new BadRequestException(
        'This container has a uncompleted publishment.'
      );
    }

    const eventsCnt = await this.prisma.event.count({
      where: {
        containerId,
      },
    });

    const asyncPublish = await this.create({
      data: {
        containerId,
        eventsCnt,
      },
    });

    const where = {
      id: asyncPublish.id,
    };

    // clear moblogs
    await this.prisma.mboLog.deleteMany({
      where,
    });

    await this.prisma.asyncPublish.update({
      where,
      data: {
        status: AsyncEventStatus.PENDING,
      },
    });

    this.eventEmitter.emit('schdules.remove', {
      asyncPublishId: asyncPublish.id,
    });
  }

  async removeSchdules(params) {
    console.log('removeSchdules', params);
    const {asyncPublishId} = params;
    const asyncPublish = await this.prisma.asyncPublish.findFirstOrThrow({
      where: {
        id: asyncPublishId,
      },
    });

    const where = {
      id: asyncPublishId,
    };
    await this.prisma.asyncPublish.update({
      where,
      data: {
        status: AsyncEventStatus.REMOVING,
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

    const {year, month, venue} = container;

    const studioId = venue.external_studioId || 0;
    const locationId = venue.external_locationId || 0;

    const startDateTime = moment()
      .year(year)
      .month(month - 1)
      .startOf('month')
      .toISOString();
    const endDateTime = moment()
      .year(year)
      .month(month - 1)
      .endOf('month')
      .toISOString();

    const schEndDate = moment().add(2, 'years').toISOString();

    const schParams = {
      page: 1,
      pageSize: 1000,
      studioId,
      LocationId: locationId,
      startDateTime,
      endDateTime,
    };

    const {data} = await this.mindbodyService.getClasses(schParams);

    await this.prisma.asyncPublish.update({
      where,
      data: {
        oldEvents: data.Classes.length,
      },
    });

    // for (const _class of []) {
    for (const _class of data.Classes) {
      // console.log(_class);
      const {ClassScheduleId} = _class;
      const schParams = {
        studioId,
        locationId,
        classScheduleIds: ClassScheduleId,
        endDate: schEndDate,
      };
      console.log(schParams);
      const schResp = await this.mindbodyService.getClassSchedules(schParams);

      const _sch = _.get(schResp, 'data.ClassSchedules[0]');

      console.log(_sch.StartDate);

      const rmSchParams = {
        studioId,
        locationId,
        scheduleId: ClassScheduleId,
      };

      const startDate = moment(_sch.StartDate);
      const endOfMonth = moment().endOf('month');

      let resp = {};

      const mboLogData: any = {
        containerId,
        locationId,
        studioId,
        asyncPublishId,
        params: rmSchParams,
      };

      if (startDate.isBefore(endOfMonth)) {
        mboLogData.funcName = 'endClassSchduleById';
        resp = await this.mindbodyService.endClassSchduleById(rmSchParams);
      } else {
        mboLogData.funcName = 'endClassFeatureSchduleById';

        resp =
          await this.mindbodyService.endClassFeatureSchduleById(rmSchParams);
      }

      mboLogData.resp = resp;
      // const resp = await this.mindbodyService.endClassSchduleById(rmSchParams);
      console.log('mboLogData', mboLogData);
      await this.prisma.mboLog.create({data: mboLogData});
    }
    await this.prisma.asyncPublish.update({
      where,
      data: {
        status: AsyncEventStatus.REMOVED,
      },
    });
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
      },
    });

    await this.prisma.asyncPublish.update({
      where,
      data: {
        status: AsyncEventStatus.PUBLISHING,
        eventsCnt: events.length,
      },
    });

    for (const e of events) {
      this.eventEmitter.emit('schdules.addOne', {
        eventId: e.id,
        asyncPublishId: asyncPublish.id,
      });
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

    const event = await this.prisma.event.findUniqueOrThrow({
      where: {id: eventId},
      include: {type: true, venue: true, changeLogs: true},
    });

    const {_event, _body} = this.scToMbService.parseBodyEvent({
      body: {},
      event,
    });
    await this.scToMbService.eventCheck(_event, _body);

    // const resp1 = this.scToMbService.getResult();
    // console.log(resp1.currentClass);
    // return;
    await this.scToMbService.eventPublish();
    const resp = this.scToMbService.getResult();

    const mboLogData: any = {
      containerId,
      studioId: this.scToMbService.studioId,
      locationId: this.scToMbService.locationId,
      asyncPublishId,
      params: {},
      funcName: 'eventPublish',
      resp,
    };
    await this.prisma.mboLog.create({data: mboLogData});

    console.log('resp.success', resp.success);

    console.log(resp.currentClass);

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

    if (!resp.success) {
      return resp;
    }

    // // [step 2] Modify coaches' availability status
    await this.availabilityTimeslotService.checkin(event);

    // // [step 2] Update event status.
    await this.prisma.event.update({
      where: {id: eventId},
      data: {isPublished: true},
    });
    return resp;
  }
}
