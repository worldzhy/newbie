import {Injectable} from '@nestjs/common';
import {Prisma, GmapPlace} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class GmapPlaceService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    params: Prisma.GmapPlaceFindUniqueArgs
  ): Promise<GmapPlace | null> {
    return await this.prisma.gmapPlace.findUnique(params);
  }

  async findMany(params: Prisma.GmapPlaceFindManyArgs): Promise<GmapPlace[]> {
    return await this.prisma.gmapPlace.findMany(params);
  }

  async create(params: Prisma.GmapPlaceCreateArgs): Promise<GmapPlace> {
    return await this.prisma.gmapPlace.create(params);
  }

  async update(params: Prisma.GmapPlaceUpdateArgs): Promise<GmapPlace> {
    return await this.prisma.gmapPlace.update(params);
  }

  async delete(params: Prisma.GmapPlaceDeleteArgs): Promise<GmapPlace> {
    return await this.prisma.gmapPlace.delete(params);
  }

  /* End */
}
