import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../../toolkit/prisma/prisma.service';
import {Prisma, Role} from '@prisma/client';

@Injectable()
export class RoleService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(params: Prisma.RoleFindUniqueArgs): Promise<Role | null> {
    return await this.prisma.role.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.RoleFindUniqueOrThrowArgs
  ): Promise<Role> {
    return await this.prisma.role.findUniqueOrThrow(params);
  }

  async findMany(params: Prisma.RoleFindManyArgs) {
    return await this.prisma.role.findMany(params);
  }

  async create(params: Prisma.RoleCreateArgs): Promise<Role> {
    return await this.prisma.role.create(params);
  }

  async update(params: Prisma.RoleUpdateArgs): Promise<Role> {
    return await this.prisma.role.update(params);
  }

  async delete(params: Prisma.RoleDeleteArgs): Promise<Role> {
    return await this.prisma.role.delete(params);
  }

  /* End */
}
