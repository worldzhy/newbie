import {Injectable} from '@nestjs/common';
import {Prisma, User} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {verifyUuid} from '@toolkit/validators/user.validator';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

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

  async findManyWithPagination(
    params: Prisma.UserFindManyArgs,
    pagination?: {page: number; pageSize: number}
  ) {
    return await this.prisma.findManyWithPagination(
      Prisma.ModelName.User,
      params,
      pagination
    );
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
