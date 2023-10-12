import {Injectable} from '@nestjs/common';
import {Prisma, User} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {verifyUuid} from '@toolkit/validators/user.validator';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(args: Prisma.UserFindUniqueArgs): Promise<User | null> {
    return await this.prisma.user.findUnique(args);
  }

  async findUniqueOrThrow(
    args: Prisma.UserFindUniqueOrThrowArgs
  ): Promise<User> {
    return await this.prisma.user.findUniqueOrThrow(args);
  }

  async findMany(args: Prisma.UserFindManyArgs): Promise<User[]> {
    return await this.prisma.user.findMany(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.UserFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.User,
      pagination,
      findManyArgs,
    });
  }

  async create(args: Prisma.UserCreateArgs): Promise<User> {
    return await this.prisma.user.create(args);
  }

  async update(args: Prisma.UserUpdateArgs): Promise<User> {
    return await this.prisma.user.update(args);
  }

  async delete(args: Prisma.UserDeleteArgs): Promise<User> {
    return await this.prisma.user.delete(args);
  }

  async count(args: Prisma.UserCountArgs): Promise<number> {
    return await this.prisma.user.count(args);
  }

  /**
   * The account supports uuid / email / phone.
   */
  async findByAccount(account: string): Promise<User | null> {
    if (verifyUuid(account)) {
      return await this.prisma.user.findUnique({where: {id: account}});
    } else {
      const users = await this.prisma.user.findMany({
        where: {
          OR: [
            {email: {equals: account, mode: 'insensitive'}},
            {phone: account},
          ],
        },
      });
      return users.length > 0 ? (users[0] as User) : null;
    }
  }

  async checkExistence(id: string) {
    const count = await this.prisma.user.count({
      where: {id},
    });
    return count > 0 ? true : false;
  }

  withoutPassword(user: User) {
    const {password, ...others} = user;
    return others;
  }

  /* End */
}
