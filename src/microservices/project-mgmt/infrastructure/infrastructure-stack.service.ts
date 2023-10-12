import {Injectable} from '@nestjs/common';
import {InfrastructureStack, Prisma} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class ProjectInfrastructureStackService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    args: Prisma.InfrastructureStackFindUniqueOrThrowArgs
  ): Promise<InfrastructureStack> {
    return await this.prisma.infrastructureStack.findUniqueOrThrow(args);
  }

  async findMany(
    args: Prisma.InfrastructureStackFindManyArgs
  ): Promise<InfrastructureStack[]> {
    return await this.prisma.infrastructureStack.findMany(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.InfrastructureStackFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.InfrastructureStack,
      pagination,
      findManyArgs,
    });
  }

  async create(
    args: Prisma.InfrastructureStackCreateArgs
  ): Promise<InfrastructureStack> {
    return await this.prisma.infrastructureStack.create(args);
  }

  async update(
    args: Prisma.InfrastructureStackUpdateArgs
  ): Promise<InfrastructureStack> {
    return await this.prisma.infrastructureStack.update(args);
  }

  async delete(
    args: Prisma.InfrastructureStackDeleteArgs
  ): Promise<InfrastructureStack> {
    return await this.prisma.infrastructureStack.delete(args);
  }
}
