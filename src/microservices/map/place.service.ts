import {Injectable} from '@nestjs/common';
import {Prisma, Place} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class PlaceService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    params: Prisma.PlaceFindUniqueOrThrowArgs
  ): Promise<Place> {
    return await this.prisma.place.findUniqueOrThrow(params);
  }

  async findMany(params: Prisma.PlaceFindManyArgs): Promise<Place[]> {
    return await this.prisma.place.findMany(params);
  }

  async findManyWithPagination(
    params: Prisma.PlaceFindManyArgs,
    pagination: {page?: number; pageSize?: number}
  ) {
    return await this.prisma.findManyWithPagination(
      Prisma.ModelName.Place,
      params,
      pagination
    );
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
