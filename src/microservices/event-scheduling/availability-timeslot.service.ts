import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Prisma, AvailabilityTimeslot} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {dateMinusMinutes, datePlusMinutes} from '@toolkit/utilities/date.util';

@Injectable()
export class AvailabilityTimeslotService {
  public minutesOfTimeslot: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {
    this.minutesOfTimeslot = parseInt(
      this.configService.getOrThrow<string>(
        'microservice.eventScheduling.minutesOfTimeslot'
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

  floorDatetimeOfStart(datetimeOfStart: Date) {
    return dateMinusMinutes(
      datetimeOfStart,
      datetimeOfStart.getMinutes() % this.minutesOfTimeslot
    );
  }

  ceilDatetimeOfEnd(datetimeOfEnd: Date) {
    if (datetimeOfEnd.getMinutes() % this.minutesOfTimeslot === 0) {
      return datetimeOfEnd;
    } else {
      return datePlusMinutes(
        datetimeOfEnd,
        this.minutesOfTimeslot -
          (datetimeOfEnd.getMinutes() % this.minutesOfTimeslot)
      );
    }
  }

  /* End */
}
