import {Injectable} from '@nestjs/common';
import {Prisma, AvailabilityProvider} from '@prisma/client';
import {PrismaService} from '../../toolkit/prisma/prisma.service';

@Injectable()
export class AvailabilityProviderService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    params: Prisma.AvailabilityProviderFindUniqueArgs
  ): Promise<AvailabilityProvider | null> {
    return await this.prisma.availabilityProvider.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.AvailabilityProviderFindUniqueOrThrowArgs
  ): Promise<AvailabilityProvider> {
    return await this.prisma.availabilityProvider.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.AvailabilityProviderFindManyArgs
  ): Promise<AvailabilityProvider[]> {
    return await this.prisma.availabilityProvider.findMany(params);
  }

  async create(
    params: Prisma.AvailabilityProviderCreateArgs
  ): Promise<AvailabilityProvider> {
    return await this.prisma.availabilityProvider.create(params);
  }

  async createMany(
    params: Prisma.AvailabilityProviderCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.availabilityProvider.createMany(params);
  }

  async update(
    params: Prisma.AvailabilityProviderUpdateArgs
  ): Promise<AvailabilityProvider> {
    return await this.prisma.availabilityProvider.update(params);
  }

  async updateMany(
    params: Prisma.AvailabilityProviderUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.availabilityProvider.updateMany(params);
  }

  async delete(
    params: Prisma.AvailabilityProviderDeleteArgs
  ): Promise<AvailabilityProvider> {
    return await this.prisma.availabilityProvider.delete(params);
  }

  /* End */
}
