import {Injectable} from '@nestjs/common';
import {Prisma, Place} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class PlaceService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(args: Prisma.PlaceFindUniqueArgs): Promise<Place | null> {
    return await this.prisma.place.findUnique(args);
  }

  async findUniqueOrThrow(
    args: Prisma.PlaceFindUniqueOrThrowArgs
  ): Promise<Place> {
    return await this.prisma.place.findUniqueOrThrow(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.PlaceFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.Place,
      pagination,
      findManyArgs,
    });
  }

  async create(args: Prisma.PlaceCreateArgs): Promise<Place> {
    return await this.prisma.place.create(args);
  }

  async update(args: Prisma.PlaceUpdateArgs): Promise<Place> {
    return await this.prisma.place.update(args);
  }

  async upsert(args: Prisma.PlaceUpsertArgs): Promise<Place> {
    return await this.prisma.place.upsert(args);
  }

  async delete(args: Prisma.PlaceDeleteArgs): Promise<Place> {
    return await this.prisma.place.delete(args);
  }

  /* End */
}
