import {Injectable} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class RoleService {
  static RoleName = {
    ADMIN: 'Admin',
    EVENT_HOST: 'Event Host',
    EVENT_MANAGER: 'Event Manager',
  };

  constructor(private readonly prisma: PrismaService) {}

  async isAdmin(userId: string) {
    const count = await this.prisma.role.count({
      where: {
        name: RoleService.RoleName.ADMIN,
        users: {some: {id: userId}},
      },
    });

    return count > 0 ? true : false;
  }

  /* End */
}
