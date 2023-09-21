import {Injectable} from '@nestjs/common';
import {Prisma, Reservation} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class ReservationService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    params: Prisma.ReservationFindUniqueOrThrowArgs
  ): Promise<Reservation> {
    return await this.prisma.reservation.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.ReservationFindManyArgs
  ): Promise<Reservation[]> {
    return await this.prisma.reservation.findMany(params);
  }

  async create(params: Prisma.ReservationCreateArgs): Promise<Reservation> {
    return await this.prisma.reservation.create(params);
  }

  async createMany(
    params: Prisma.ReservationCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.reservation.createMany(params);
  }

  async update(params: Prisma.ReservationUpdateArgs): Promise<Reservation> {
    return await this.prisma.reservation.update(params);
  }

  async updateMany(
    params: Prisma.ReservationUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.reservation.updateMany(params);
  }

  async delete(params: Prisma.ReservationDeleteArgs): Promise<Reservation> {
    return await this.prisma.reservation.delete(params);
  }

  /* End */
}
