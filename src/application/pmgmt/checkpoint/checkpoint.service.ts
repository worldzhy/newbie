import {Injectable} from '@nestjs/common';
import {Prisma, ProjectCheckpoint} from '@prisma/client';
import {PrismaService} from '../../../toolkit/prisma/prisma.service';

@Injectable()
export class ProjectCheckpointService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(
    params: Prisma.ProjectCheckpointFindUniqueArgs
  ): Promise<ProjectCheckpoint | null> {
    return await this.prisma.projectCheckpoint.findUnique(params);
  }

  async findMany(
    params: Prisma.ProjectCheckpointFindManyArgs
  ): Promise<ProjectCheckpoint[]> {
    return await this.prisma.projectCheckpoint.findMany(params);
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
