import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../../toolkit/prisma/prisma.service';
import {Prisma, User} from '@prisma/client';
import {verifyUuid} from '../../../toolkit/validators/user.validator';

@Injectable()
export class UserService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(params: Prisma.UserFindUniqueArgs): Promise<User | null> {
    return await this.prisma.user.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.UserFindUniqueOrThrowArgs
  ): Promise<User> {
    return await this.prisma.user.findUniqueOrThrow(params);
  }

  async findMany(params: Prisma.UserFindManyArgs): Promise<User[]> {
    return await this.prisma.user.findMany(params);
  }

  async findManyWithTotal(
    params: Prisma.UserFindManyArgs
  ): Promise<[User[], number]> {
    return await this.prisma.$transaction([
      this.prisma.user.findMany(params),
      this.prisma.user.count({where: params.where}),
    ]);
  }

  async create(params: Prisma.UserCreateArgs): Promise<User> {
    return await this.prisma.user.create(params);
  }

  async update(params: Prisma.UserUpdateArgs): Promise<User> {
    return await this.prisma.user.update(params);
  }

  async delete(params: Prisma.UserDeleteArgs): Promise<User> {
    return await this.prisma.user.delete(params);
  }

  async count(params: Prisma.UserCountArgs): Promise<number> {
    return await this.prisma.user.count(params);
  }

  async findUniqueOrThrowWithRoles(
    params: Prisma.UserFindUniqueArgs
  ): Promise<User> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: params.where,
      include: {userToRoles: {select: {role: true}}, locations: true},
    });

    user['roles'] = user.userToRoles.map(userToRole => {
      return userToRole['role'];
    });

    const {userToRoles, locations, ...result} = user;
    return result;
  }

  /**
   * The account supports username / email / phone.
   */
  async findByAccount(account: string): Promise<User | null> {
    if (verifyUuid(account)) {
      return await this.prisma.user.findUnique({where: {id: account}});
    } else {
      const users = await this.prisma.user.findMany({
        where: {
          OR: [
            {username: account},
            {email: {equals: account, mode: 'insensitive'}},
            {phone: account},
          ],
        },
      });
      return users.length > 0 ? (users[0] as User) : null;
    }
  }

  withoutPassword(user: User) {
    const {password, ...others} = user;
    return others;
  }

  /* End */
}
