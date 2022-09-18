import {Injectable} from '@nestjs/common';
import {Prisma, ProjectCheckpoint} from '@prisma/client';
import {PrismaService} from '../../../toolkits/prisma/prisma.service';

@Injectable()
export class CheckpointService {
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
    data: Prisma.ProjectCheckpointCreateInput
  ): Promise<ProjectCheckpoint> {
    return await this.prisma.projectCheckpoint.create({data});
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
