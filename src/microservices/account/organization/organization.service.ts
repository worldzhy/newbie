import {Injectable} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {Prisma, Organization} from '@prisma/client';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    args: Prisma.OrganizationFindUniqueOrThrowArgs
  ): Promise<Organization> {
    return await this.prisma.organization.findUniqueOrThrow(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.OrganizationFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.Organization,
      pagination,
      findManyArgs,
    });
  }

  async create(args: Prisma.OrganizationCreateArgs): Promise<Organization> {
    return await this.prisma.organization.create(args);
  }

  async update(args: Prisma.OrganizationUpdateArgs): Promise<Organization> {
    return await this.prisma.organization.update(args);
  }

  async delete(args: Prisma.OrganizationDeleteArgs): Promise<Organization> {
    return await this.prisma.organization.delete(args);
  }

  /* End */
}
