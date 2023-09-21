import {Injectable} from '@nestjs/common';
import {InfrastructureStack, Prisma} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class ProjectInfrastructureStackService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    params: Prisma.InfrastructureStackFindUniqueOrThrowArgs
  ): Promise<InfrastructureStack> {
    return await this.prisma.infrastructureStack.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.InfrastructureStackFindManyArgs
  ): Promise<InfrastructureStack[]> {
    return await this.prisma.infrastructureStack.findMany(params);
  }

  async findManyWithPagination(
    params: Prisma.InfrastructureStackFindManyArgs,
    pagination: {page?: number; pageSize?: number}
  ) {
    return await this.prisma.findManyWithPagination(
      Prisma.ModelName.InfrastructureStack,
      params,
      pagination
    );
  }

  async create(
    params: Prisma.InfrastructureStackCreateArgs
  ): Promise<InfrastructureStack> {
    return await this.prisma.infrastructureStack.create(params);
  }

  async update(
    params: Prisma.InfrastructureStackUpdateArgs
  ): Promise<InfrastructureStack> {
    return await this.prisma.infrastructureStack.update(params);
  }

  async delete(
    params: Prisma.InfrastructureStackDeleteArgs
  ): Promise<InfrastructureStack> {
    return await this.prisma.infrastructureStack.delete(params);
  }
}
