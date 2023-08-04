import {Injectable} from '@nestjs/common';
import {Prisma, AvailabilityContainer} from '@prisma/client';
import {PrismaService} from '../../toolkit/prisma/prisma.service';

@Injectable()
export class AvailabilityContainerService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    params: Prisma.AvailabilityContainerFindUniqueArgs
  ): Promise<AvailabilityContainer | null> {
    return await this.prisma.availabilityContainer.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.AvailabilityContainerFindUniqueOrThrowArgs
  ): Promise<AvailabilityContainer> {
    return await this.prisma.availabilityContainer.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.AvailabilityContainerFindManyArgs
  ): Promise<AvailabilityContainer[]> {
    return await this.prisma.availabilityContainer.findMany(params);
  }

  async create(
    params: Prisma.AvailabilityContainerCreateArgs
  ): Promise<AvailabilityContainer> {
    return await this.prisma.availabilityContainer.create(params);
  }

  async createMany(
    params: Prisma.AvailabilityContainerCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.availabilityContainer.createMany(params);
  }

  async update(
    params: Prisma.AvailabilityContainerUpdateArgs
  ): Promise<AvailabilityContainer> {
    return await this.prisma.availabilityContainer.update(params);
  }

  async updateMany(
    params: Prisma.AvailabilityContainerUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.availabilityContainer.updateMany(params);
  }

  async delete(
    params: Prisma.AvailabilityContainerDeleteArgs
  ): Promise<AvailabilityContainer> {
    return await this.prisma.availabilityContainer.delete(params);
  }

  /* End */
}
