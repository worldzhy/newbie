import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../../toolkits/prisma/prisma.service';
import {Prisma, User} from '@prisma/client';
import {generateHash} from '../../../toolkits/utilities/common.util';
import {verifyUuid} from '../../../toolkits/validators/account.validator';

@Injectable()
export class UserService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(params: Prisma.UserFindUniqueArgs): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique(params);
    } catch (error) {
      return error;
    }
  }

  async findMany(params: Prisma.UserFindManyArgs): Promise<User[]> {
    return await this.prisma.user.findMany(params);
  }

  async create(params: Prisma.UserCreateArgs): Promise<User> {
    // [middleware] Hash password.
    this.prisma.$use(async (params, next) => {
      if (params.model === 'User') {
        if (params.action === 'create') {
          if (params.args['data']['password']) {
            // [step 3] Generate the new password hash.
            const hash = await generateHash(params.args['data']['password']);
            params.args['data']['password'] = hash;
          }
        }
      }
      return next(params);
    });

    try {
      return await this.prisma.user.create(params);
    } catch (error) {
      return error;
    }
  }

  async update(params: Prisma.UserUpdateArgs): Promise<User> {
    // [middleware] Hash password.
    this.prisma.$use(async (params, next) => {
      if (params.model === 'User') {
        if (params.action === 'update') {
          if (params.args['data']['password']) {
            // [step 3] Generate the new password hash.
            const hash = await generateHash(params.args['data']['password']);
            params.args['data']['password'] = hash;
          }
        }
      }
      return next(params);
    });

    return await this.prisma.user.update(params);
  }

  async delete(params: Prisma.UserDeleteArgs): Promise<User> {
    return await this.prisma.user.delete(params);
  }

  /**
   * Get a user by username / email / phone.
   *
   * @param {string} account can be username, email, or phone.
   * @returns {(Promise<User | null>)}
   * @memberof UserService
   */
  async findByAccount(account: string): Promise<User | null> {
    if (verifyUuid(account)) {
      return await this.findUnique({where: {id: account}});
    } else {
      const users = await this.findMany({
        where: {
          // {id: account} will cause crash because 'id' must accept uuid parameter.
          OR: [{username: account}, {email: account}, {phone: account}],
        },
      });
      return users.length > 0 ? (users[0] as User) : null;
    }
  }

  /* End */
}
