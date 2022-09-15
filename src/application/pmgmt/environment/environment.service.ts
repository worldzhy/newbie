import {Injectable} from '@nestjs/common';
import {Prisma, ProjectEnvironment} from '@prisma/client';
import {PrismaService} from '../../../toolkits/prisma/prisma.service';

@Injectable()
export class EnvironmentService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(
    params: Prisma.ProjectEnvironmentFindUniqueArgs
  ): Promise<ProjectEnvironment | null> {
    return await this.prisma.projectEnvironment.findUnique(params);
  }

  async findMany(
    params: Prisma.ProjectEnvironmentFindManyArgs
  ): Promise<ProjectEnvironment[]> {
    return await this.prisma.projectEnvironment.findMany(params);
  }

  async create(
    data: Prisma.ProjectEnvironmentCreateInput
  ): Promise<ProjectEnvironment> {
    return await this.prisma.projectEnvironment.create({
      data,
    });
  }

  async update(
    params: Prisma.ProjectEnvironmentUpdateArgs
  ): Promise<ProjectEnvironment> {
    return await this.prisma.projectEnvironment.update(params);
  }

  /* End */
}
