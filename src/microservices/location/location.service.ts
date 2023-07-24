import {Injectable} from '@nestjs/common';
import {Prisma, Location} from '@prisma/client';
import {PrismaService} from '../../toolkit/prisma/prisma.service';

@Injectable()
export class LocationService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    params: Prisma.LocationFindUniqueArgs
  ): Promise<Location | null> {
    return await this.prisma.location.findUnique(params);
  }

  async findMany(params: Prisma.LocationFindManyArgs): Promise<Location[]> {
    return await this.prisma.location.findMany(params);
  }

  async create(params: Prisma.LocationCreateArgs): Promise<Location> {
    return await this.prisma.location.create(params);
  }

  async update(params: Prisma.LocationUpdateArgs): Promise<Location> {
    return await this.prisma.location.update(params);
  }

  async delete(params: Prisma.LocationDeleteArgs): Promise<Location> {
    return await this.prisma.location.delete(params);
  }

  /* End */
}
