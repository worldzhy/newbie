import {Injectable} from '@nestjs/common';
import {Prisma, ProjectEnvironment} from '@prisma/client';
import {PrismaService} from '../../../toolkit/prisma/prisma.service';

@Injectable()
export class ProjectEnvironmentService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(
    params: Prisma.ProjectEnvironmentFindUniqueArgs
  ): Promise<ProjectEnvironment | null> {
    return await this.prisma.projectEnvironment.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.ProjectEnvironmentFindUniqueOrThrowArgs
  ): Promise<ProjectEnvironment> {
    return await this.prisma.projectEnvironment.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.ProjectEnvironmentFindManyArgs
  ): Promise<ProjectEnvironment[]> {
    return await this.prisma.projectEnvironment.findMany(params);
  }

  async create(
    params: Prisma.ProjectEnvironmentCreateArgs
  ): Promise<ProjectEnvironment> {
    return await this.prisma.projectEnvironment.create(params);
  }

  async update(
    params: Prisma.ProjectEnvironmentUpdateArgs
  ): Promise<ProjectEnvironment> {
    return await this.prisma.projectEnvironment.update(params);
  }

  async delete(
    params: Prisma.ProjectEnvironmentDeleteArgs
  ): Promise<ProjectEnvironment> {
    return await this.prisma.projectEnvironment.delete(params);
  }

  /* End */
}
