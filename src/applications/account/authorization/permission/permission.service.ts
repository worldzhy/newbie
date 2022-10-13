import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../../../toolkits/prisma/prisma.service';
import {Prisma, Permission} from '@prisma/client';

@Injectable()
export class PermissionService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(
    params: Prisma.PermissionFindUniqueArgs
  ): Promise<Permission | null> {
    return await this.prisma.permission.findUnique(params);
  }

  async findMany(params: Prisma.PermissionFindManyArgs) {
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
