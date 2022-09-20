import {Injectable} from '@nestjs/common';
import {Prisma, Project} from '@prisma/client';
import {PrismaService} from '../../../toolkits/prisma/prisma.service';

@Injectable()
export class ProjectService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(
    params: Prisma.ProjectFindUniqueArgs
  ): Promise<Project | null> {
    return await this.prisma.project.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.ProjectFindUniqueOrThrowArgs
  ): Promise<Project> {
    return await this.prisma.project.findUniqueOrThrow(params);
  }

  async findMany(params: Prisma.ProjectFindManyArgs): Promise<Project[]> {
    return await this.prisma.project.findMany(params);
  }

  async create(params: Prisma.ProjectCreateArgs): Promise<Project> {
    return await this.prisma.project.create(params);
  }

  async update(params: Prisma.ProjectUpdateArgs): Promise<Project> {
    return await this.prisma.project.update(params);
  }

  async delete(params: Prisma.ProjectDeleteArgs): Promise<Project> {
    return await this.prisma.project.delete(params);
  }

  async checkExistence(id: string) {
    const count = await this.prisma.project.count({
      where: {id},
    });
    return count > 0 ? true : false;
  }

  /* End */
}
