import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Prisma, AvailabilityTimeslot} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {
  dateMinusMinutes,
  datePlusMinutes,
} from '@toolkit/utilities/datetime.util';

@Injectable()
export class AvailabilityTimeslotService {
  public MINUTES_Of_TIMESLOT_UNIT: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {
    this.MINUTES_Of_TIMESLOT_UNIT = parseInt(
      this.configService.getOrThrow<string>(
        'microservice.eventScheduling.minutesOfTimeslotUnit'
      )
    );
  }

  async findUniqueOrThrow(
    params: Prisma.AvailabilityTimeslotFindUniqueOrThrowArgs
  ): Promise<AvailabilityTimeslot> {
    return await this.prisma.availabilityTimeslot.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.AvailabilityTimeslotFindManyArgs
  ): Promise<AvailabilityTimeslot[]> {
    return await this.prisma.availabilityTimeslot.findMany(params);
  }

  async create(
    params: Prisma.AvailabilityTimeslotCreateArgs
  ): Promise<AvailabilityTimeslot> {
    return await this.prisma.availabilityTimeslot.create(params);
  }

  async createMany(
    params: Prisma.AvailabilityTimeslotCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.availabilityTimeslot.createMany(params);
  }

  async update(
    params: Prisma.AvailabilityTimeslotUpdateArgs
  ): Promise<AvailabilityTimeslot> {
    return await this.prisma.availabilityTimeslot.update(params);
  }

  async updateMany(
    params: Prisma.AvailabilityTimeslotUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.availabilityTimeslot.updateMany(params);
  }

  async delete(
    params: Prisma.AvailabilityTimeslotDeleteArgs
  ): Promise<AvailabilityTimeslot> {
    return await this.prisma.availabilityTimeslot.delete(params);
  }

  async deleteMany(
    params: Prisma.AvailabilityTimeslotDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.availabilityTimeslot.deleteMany(params);
  }

  async count(params: Prisma.AvailabilityTimeslotCountArgs): Promise<number> {
    return await this.prisma.availabilityTimeslot.count(params);
  }

  async groupByHostUserId(params: {
    hostUserIds: string[];
    venueId: number;
    datetimeOfStart: Date;
    datetimeOfEnd: Date;
  }) {
    return await this.prisma.availabilityTimeslot.groupBy({
      by: ['hostUserId'],
      where: {
        hostUserId: {
          in: params.hostUserIds,
        },
        venueIds: {has: params.venueId},
        datetimeOfStart: {gte: params.datetimeOfStart},
        datetimeOfEnd: {lte: params.datetimeOfEnd},
      },
      _count: {hostUserId: true},
    });
  }

  floorDatetimeOfStart(datetimeOfStart: Date) {
    return dateMinusMinutes(
      datetimeOfStart,
      datetimeOfStart.getMinutes() % this.MINUTES_Of_TIMESLOT_UNIT
    );
  }

  ceilDatetimeOfEnd(datetimeOfEnd: Date) {
    if (datetimeOfEnd.getMinutes() % this.MINUTES_Of_TIMESLOT_UNIT === 0) {
      return datetimeOfEnd;
    } else {
      return datePlusMinutes(
        datetimeOfEnd,
        this.MINUTES_Of_TIMESLOT_UNIT -
          (datetimeOfEnd.getMinutes() % this.MINUTES_Of_TIMESLOT_UNIT)
      );
    }
  }

  /* End */
}
