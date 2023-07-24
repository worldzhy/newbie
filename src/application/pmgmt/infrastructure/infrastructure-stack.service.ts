import {Injectable} from '@nestjs/common';
import {InfrastructureStack, Prisma} from '@prisma/client';
import {PrismaService} from '../../../toolkit/prisma/prisma.service';

@Injectable()
export class ProjectInfrastructureStackService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    params: Prisma.InfrastructureStackFindUniqueArgs
  ): Promise<InfrastructureStack | null> {
    return await this.prisma.infrastructureStack.findUnique(params);
  }

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
