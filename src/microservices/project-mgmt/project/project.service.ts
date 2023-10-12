import {Injectable} from '@nestjs/common';
import {Prisma, Project} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    args: Prisma.ProjectFindUniqueOrThrowArgs
  ): Promise<Project> {
    return await this.prisma.project.findUniqueOrThrow(args);
  }

  async findMany(args: Prisma.ProjectFindManyArgs): Promise<Project[]> {
    return await this.prisma.project.findMany(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.ProjectFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.Project,
      pagination,
      findManyArgs,
    });
  }

  async create(args: Prisma.ProjectCreateArgs): Promise<Project> {
    return await this.prisma.project.create(args);
  }

  async update(args: Prisma.ProjectUpdateArgs): Promise<Project> {
    return await this.prisma.project.update(args);
  }

  async delete(args: Prisma.ProjectDeleteArgs): Promise<Project> {
    return await this.prisma.project.delete(args);
  }

  async checkExistence(id: string) {
    const count = await this.prisma.project.count({
      where: {id},
    });
    return count > 0 ? true : false;
  }

  /* End */
}
