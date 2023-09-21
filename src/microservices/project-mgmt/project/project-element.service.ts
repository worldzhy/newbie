import {Injectable} from '@nestjs/common';
import {Prisma, ProjectElement} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class ProjectElementService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    params: Prisma.ProjectElementFindUniqueOrThrowArgs
  ): Promise<ProjectElement> {
    return await this.prisma.projectElement.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.ProjectElementFindManyArgs
  ): Promise<ProjectElement[]> {
    return await this.prisma.projectElement.findMany(params);
  }

  async findManyWithPagination(
    params: Prisma.ProjectElementFindManyArgs,
    pagination: {page?: number; pageSize?: number}
  ) {
    return await this.prisma.findManyWithPagination(
      Prisma.ModelName.ProjectElement,
      params,
      pagination
    );
  }

  async create(
    params: Prisma.ProjectElementCreateArgs
  ): Promise<ProjectElement> {
    return await this.prisma.projectElement.create(params);
  }

  async update(
    params: Prisma.ProjectElementUpdateArgs
  ): Promise<ProjectElement> {
    return await this.prisma.projectElement.update(params);
  }

  async delete(
    params: Prisma.ProjectElementDeleteArgs
  ): Promise<ProjectElement> {
    return await this.prisma.projectElement.delete(params);
  }

  /* End */
}
