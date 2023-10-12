import {Injectable} from '@nestjs/common';
import {Prisma, ProjectCheckpoint} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class ProjectCheckpointService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    args: Prisma.ProjectCheckpointFindUniqueOrThrowArgs
  ): Promise<ProjectCheckpoint> {
    return await this.prisma.projectCheckpoint.findUniqueOrThrow(args);
  }

  async findMany(
    args: Prisma.ProjectCheckpointFindManyArgs
  ): Promise<ProjectCheckpoint[]> {
    return await this.prisma.projectCheckpoint.findMany(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.ProjectCheckpointFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.ProjectCheckpoint,
      pagination,
      findManyArgs,
    });
  }

  async create(
    args: Prisma.ProjectCheckpointCreateArgs
  ): Promise<ProjectCheckpoint> {
    return await this.prisma.projectCheckpoint.create(args);
  }

  async update(
    args: Prisma.ProjectCheckpointUpdateArgs
  ): Promise<ProjectCheckpoint> {
    return await this.prisma.projectCheckpoint.update(args);
  }

  async delete(
    args: Prisma.ProjectCheckpointDeleteArgs
  ): Promise<ProjectCheckpoint> {
    return await this.prisma.projectCheckpoint.delete(args);
  }

  /* End */
}
