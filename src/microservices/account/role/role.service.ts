import {Injectable} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {Prisma, Role} from '@prisma/client';

@Injectable()
export class RoleService {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueOrThrow(
    args: Prisma.RoleFindUniqueOrThrowArgs
  ): Promise<Role> {
    return await this.prisma.role.findUniqueOrThrow(args);
  }

  async findManyInOnePage(findManyArgs?: Prisma.RoleFindManyArgs) {
    return await this.prisma.findManyInOnePage({
      model: Prisma.ModelName.Role,
      findManyArgs,
    });
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.RoleFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.Role,
      pagination,
      findManyArgs,
    });
  }

  async create(args: Prisma.RoleCreateArgs): Promise<Role> {
    return await this.prisma.role.create(args);
  }

  async update(args: Prisma.RoleUpdateArgs): Promise<Role> {
    return await this.prisma.role.update(args);
  }

  async delete(args: Prisma.RoleDeleteArgs): Promise<Role> {
    return await this.prisma.role.delete(args);
  }

  /* End */
}
