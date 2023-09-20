import {Injectable} from '@nestjs/common';
import {Prisma, AvailabilityExpression} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class AvailabilityExpressionService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    params: Prisma.AvailabilityExpressionFindUniqueArgs
  ): Promise<AvailabilityExpression | null> {
    return await this.prisma.availabilityExpression.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.AvailabilityExpressionFindUniqueOrThrowArgs
  ): Promise<AvailabilityExpression> {
    return await this.prisma.availabilityExpression.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.AvailabilityExpressionFindManyArgs
  ): Promise<AvailabilityExpression[]> {
    return await this.prisma.availabilityExpression.findMany(params);
  }

  async findManyWithPagination(
    params: Prisma.AvailabilityExpressionFindManyArgs,
    pagination: {page?: number; pageSize?: number}
  ) {
    return await this.prisma.findManyWithPagination(
      Prisma.ModelName.AvailabilityExpression,
      params,
      pagination
    );
  }

  async create(
    params: Prisma.AvailabilityExpressionCreateArgs
  ): Promise<AvailabilityExpression> {
    return await this.prisma.availabilityExpression.create(params);
  }

  async createMany(
    params: Prisma.AvailabilityExpressionCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.availabilityExpression.createMany(params);
  }

  async update(
    params: Prisma.AvailabilityExpressionUpdateArgs
  ): Promise<AvailabilityExpression> {
    return await this.prisma.availabilityExpression.update(params);
  }

  async updateMany(
    params: Prisma.AvailabilityExpressionUpdateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.availabilityExpression.updateMany(params);
  }

  async delete(
    params: Prisma.AvailabilityExpressionDeleteArgs
  ): Promise<AvailabilityExpression> {
    return await this.prisma.availabilityExpression.delete(params);
  }

  /* End */
}
