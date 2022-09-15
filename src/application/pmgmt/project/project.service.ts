import {Injectable} from '@nestjs/common';
import {Prisma, Project} from '@prisma/client';
import {PrismaService} from '../../../tools/prisma/prisma.service';

@Injectable()
export class ProjectService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(
    params: Prisma.ProjectFindUniqueArgs
  ): Promise<Project | null> {
    return await this.prisma.project.findUnique(params);
  }

  async findMany(params: Prisma.ProjectFindManyArgs): Promise<Project[]> {
    return await this.prisma.project.findMany(params);
  }

  async create(data: Prisma.ProjectCreateInput): Promise<Project> {
    try {
      return await this.prisma.project.create({
        data,
      });
    } catch (error) {
      return error;
    }
  }

  async update(params: Prisma.ProjectUpdateArgs): Promise<Project> {
    return await this.prisma.project.update(params);
  }

  async delete(params: Prisma.ProjectDeleteArgs): Promise<Project> {
    return await this.prisma.project.delete(params);
  }

  /**
   * Check if exist
   *
   * @param {string} id
   * @returns
   * @memberof ProjectService
   */
  async checkExistence(id: string) {
    const count = await this.prisma.project.count({
      where: {id},
    });
    return count > 0 ? true : false;
  }
  /* End */
}
