import {Injectable} from '@nestjs/common';
import {Prisma, ProjectEnvironment} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class ProjectEnvironmentService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    args: Prisma.ProjectEnvironmentFindUniqueOrThrowArgs
  ): Promise<ProjectEnvironment> {
    return await this.prisma.projectEnvironment.findUniqueOrThrow(args);
  }

  async findMany(
    args: Prisma.ProjectEnvironmentFindManyArgs
  ): Promise<ProjectEnvironment[]> {
    return await this.prisma.projectEnvironment.findMany(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.ProjectEnvironmentFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.ProjectEnvironment,
      pagination,
      findManyArgs,
    });
  }
  async create(
    args: Prisma.ProjectEnvironmentCreateArgs
  ): Promise<ProjectEnvironment> {
    return await this.prisma.projectEnvironment.create(args);
  }

  async update(
    args: Prisma.ProjectEnvironmentUpdateArgs
  ): Promise<ProjectEnvironment> {
    return await this.prisma.projectEnvironment.update(args);
  }

  async delete(
    args: Prisma.ProjectEnvironmentDeleteArgs
  ): Promise<ProjectEnvironment> {
    return await this.prisma.projectEnvironment.delete(args);
  }

  /* End */
}
