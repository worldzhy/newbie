import {Injectable} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {Prisma, Permission} from '@prisma/client';

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    args: Prisma.PermissionFindUniqueOrThrowArgs
  ): Promise<Permission> {
    return await this.prisma.permission.findUniqueOrThrow(args);
  }

  async findMany(args: Prisma.PermissionFindManyArgs): Promise<Permission[]> {
    return await this.prisma.permission.findMany(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.PermissionFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.Permission,
      pagination,
      findManyArgs,
    });
  }

  async create(args: Prisma.PermissionCreateArgs): Promise<Permission> {
    return await this.prisma.permission.create(args);
  }

  async update(args: Prisma.PermissionUpdateArgs): Promise<Permission> {
    return await this.prisma.permission.update(args);
  }

  async delete(args: Prisma.PermissionDeleteArgs): Promise<Permission> {
    return await this.prisma.permission.delete(args);
  }

  /* End */
}
