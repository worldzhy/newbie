import {Injectable} from '@nestjs/common';
import {Prisma, ProjectElement} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class ProjectElementService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    args: Prisma.ProjectElementFindUniqueOrThrowArgs
  ): Promise<ProjectElement> {
    return await this.prisma.projectElement.findUniqueOrThrow(args);
  }

  async findMany(
    args: Prisma.ProjectElementFindManyArgs
  ): Promise<ProjectElement[]> {
    return await this.prisma.projectElement.findMany(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.ProjectElementFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.ProjectElement,
      pagination,
      findManyArgs,
    });
  }

  async create(args: Prisma.ProjectElementCreateArgs): Promise<ProjectElement> {
    return await this.prisma.projectElement.create(args);
  }

  async update(args: Prisma.ProjectElementUpdateArgs): Promise<ProjectElement> {
    return await this.prisma.projectElement.update(args);
  }

  async delete(args: Prisma.ProjectElementDeleteArgs): Promise<ProjectElement> {
    return await this.prisma.projectElement.delete(args);
  }

  /* End */
}
