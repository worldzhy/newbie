import {Injectable} from '@nestjs/common';
import {Prisma, ProjectCheckpoint} from '@prisma/client';
import {PrismaService} from '../../../_prisma/_prisma.service';

@Injectable()
export class CheckpointService {
  private prisma: PrismaService = new PrismaService();

  async findOne(where: Prisma.ProjectCheckpointWhereUniqueInput) {
    return await this.prisma.projectCheckpoint.findUnique({
      where,
    });
  }

  async findMany(where: Prisma.ProjectCheckpointWhereInput) {
    return await this.prisma.projectCheckpoint.findMany({
      where,
    });
  }

  async create(
    data: Prisma.ProjectCheckpointCreateInput
  ): Promise<ProjectCheckpoint> {
    return await this.prisma.projectCheckpoint.create({
      data,
    });
  }

  async update(params: {
    where: Prisma.ProjectCheckpointWhereUniqueInput;
    data: Prisma.ProjectCheckpointUpdateInput;
  }): Promise<ProjectCheckpoint> {
    const {where, data} = params;
    return await this.prisma.projectCheckpoint.update({
      data,
      where,
    });
  }

  async delete(
    where: Prisma.ProjectCheckpointWhereUniqueInput
  ): Promise<ProjectCheckpoint> {
    return await this.prisma.projectCheckpoint.delete({
      where,
    });
  }

  /* End */
}
