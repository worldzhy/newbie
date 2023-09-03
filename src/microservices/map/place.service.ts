import {Injectable} from '@nestjs/common';
import {Prisma, Place} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class PlaceService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(params: Prisma.PlaceFindUniqueArgs): Promise<Place | null> {
    return await this.prisma.place.findUnique(params);
  }

  async findMany(params: Prisma.PlaceFindManyArgs): Promise<Place[]> {
    return await this.prisma.place.findMany(params);
  }

  async create(params: Prisma.PlaceCreateArgs): Promise<Place> {
    return await this.prisma.place.create(params);
  }

  async update(params: Prisma.PlaceUpdateArgs): Promise<Place> {
    return await this.prisma.place.update(params);
  }

  async delete(params: Prisma.PlaceDeleteArgs): Promise<Place> {
    return await this.prisma.place.delete(params);
  }

  /* End */
}
