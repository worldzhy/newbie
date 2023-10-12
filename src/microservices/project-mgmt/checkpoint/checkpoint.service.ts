import {Injectable} from '@nestjs/common';
import {Prisma, ProjectCheckpoint} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class ProjectCheckpointService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    params: Prisma.ProjectCheckpointFindUniqueOrThrowArgs
  ): Promise<ProjectCheckpoint> {
    return await this.prisma.projectCheckpoint.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.ProjectCheckpointFindManyArgs
  ): Promise<ProjectCheckpoint[]> {
    return await this.prisma.projectCheckpoint.findMany(params);
  }

  async findManyWithPagination(
    params: Prisma.ProjectCheckpointFindManyArgs,
    pagination?: {page: number; pageSize: number}
  ) {
    return await this.prisma.findManyWithPagination(
      Prisma.ModelName.ProjectCheckpoint,
      params,
      pagination
    );
  }

  async create(
    params: Prisma.ProjectCheckpointCreateArgs
  ): Promise<ProjectCheckpoint> {
    return await this.prisma.projectCheckpoint.create(params);
  }

  async update(
    params: Prisma.ProjectCheckpointUpdateArgs
  ): Promise<ProjectCheckpoint> {
    return await this.prisma.projectCheckpoint.update(params);
  }

  async delete(
    params: Prisma.ProjectCheckpointDeleteArgs
  ): Promise<ProjectCheckpoint> {
    return await this.prisma.projectCheckpoint.delete(params);
  }

  /* End */
}
