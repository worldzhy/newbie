import {Injectable} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {Prisma, Permission} from '@prisma/client';

@Injectable()
export class PermissionService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    params: Prisma.PermissionFindUniqueOrThrowArgs
  ): Promise<Permission> {
    return await this.prisma.permission.findUniqueOrThrow(params);
  }

  async findMany(params: Prisma.PermissionFindManyArgs): Promise<Permission[]> {
    return await this.prisma.permission.findMany(params);
  }

  async create(params: Prisma.PermissionCreateArgs): Promise<Permission> {
    return await this.prisma.permission.create(params);
  }

  async update(params: Prisma.PermissionUpdateArgs): Promise<Permission> {
    return await this.prisma.permission.update(params);
  }

  async delete(params: Prisma.PermissionDeleteArgs): Promise<Permission> {
    return await this.prisma.permission.delete(params);
  }

  /* End */
}
