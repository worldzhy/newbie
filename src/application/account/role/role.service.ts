import {Injectable} from '@nestjs/common';
import {Prisma, Role} from '@prisma/client';
import {PrismaService} from '../../../toolkits/prisma/prisma.service';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async role(
    roleWhereUniqueInput: Prisma.RoleWhereUniqueInput
  ): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: roleWhereUniqueInput,
    });
  }

  async roles(params?: {
    skip?: number;
    take?: number;
    cursor?: Prisma.RoleWhereUniqueInput;
    where?: Prisma.RoleWhereInput;
    orderBy?: Prisma.RoleOrderByWithRelationAndSearchRelevanceInput;
  }): Promise<Role[]> {
    if (params) {
      const {skip, take, cursor, where, orderBy} = params;
      return this.prisma.role.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
      });
    } else {
      return this.prisma.role.findMany();
    }
  }

  async create(data: Prisma.RoleCreateInput): Promise<Role> {
    try {
      return this.prisma.role.create({
        data,
      });
    } catch (error) {
      return error;
    }
  }

  async update(params: {
    where: Prisma.RoleWhereUniqueInput;
    data: Prisma.RoleUpdateInput;
  }): Promise<Role> {
    const {where, data} = params;
    return this.prisma.role.update({
      data,
      where,
    });
  }

  async delete(where: Prisma.RoleWhereUniqueInput): Promise<Role> {
    return this.prisma.role.delete({
      where,
    });
  }
}
