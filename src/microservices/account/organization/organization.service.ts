import {Injectable} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {Prisma, Organization} from '@prisma/client';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    params: Prisma.OrganizationFindUniqueOrThrowArgs
  ): Promise<Organization> {
    return await this.prisma.organization.findUniqueOrThrow(params);
  }

  async findMany(params: Prisma.OrganizationFindManyArgs) {
    return await this.prisma.organization.findMany(params);
  }

  async findManyWithPagination(
    params: Prisma.OrganizationFindManyArgs,
    pagination?: {page: number; pageSize: number}
  ) {
    return await this.prisma.findManyWithPagination(
      Prisma.ModelName.Organization,
      params,
      pagination
    );
  }

  async create(params: Prisma.OrganizationCreateArgs): Promise<Organization> {
    return await this.prisma.organization.create(params);
  }

  async update(params: Prisma.OrganizationUpdateArgs): Promise<Organization> {
    return await this.prisma.organization.update(params);
  }

  async delete(params: Prisma.OrganizationDeleteArgs): Promise<Organization> {
    return await this.prisma.organization.delete(params);
  }

  /* End */
}
