import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../../toolkits/prisma/prisma.service';
import {Prisma, User} from '@prisma/client';
import {generateHash} from '../account.util';
import {verifyUuid} from '../account.validator';

const bcrypt = require('bcryptjs');

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
    try {
      return await this.prisma.user.create(params);
    } catch (error) {
      return error;
    }
  }

  async update(params: Prisma.UserUpdateArgs): Promise<User> {
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

  /**
   * Check if a user exists
   *
   * @param {{
   *     username: string;
   *     email: string;
   *     phone: string;
   *   }} account
   * @returns {Promise<boolean>}
   * @memberof UserService
   */
  async checkAccount(account: {
    username?: string;
    email?: string;
    phone?: string;
  }): Promise<boolean> {
    const {username, email, phone} = account;
    const users = await this.findMany({
      where: {
        OR: [{username}, {email}, {phone}],
      },
    });
    if (users.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Change password
   *
   * @param {string} userId
   * @param {string} oldPassword
   * @param {string} newPassword
   * @returns
   * @memberof AuthService
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    // [step 1] Get user.
    const user = await this.findUnique({where: {id: userId}});
    if (!user) {
      return false;
    }

    // [step 2] Verify the current password.
    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (match === false) {
      return false;
    }

    // [step 3] Generate the new password hash.
    const hash = await generateHash(newPassword);

    // [step 4] Update the password.
    const result = await this.update({
      where: {id: userId},
      data: {passwordHash: hash},
    });
    if (result) {
      return true;
    } else {
      // [Mark] Update password failed. We need to investgate.
      return false;
    }
  }

  async resetPassword(userId: string, newPassword: string): Promise<boolean> {
    // [step 1] Generate the new password hash.
    const hash = await generateHash(newPassword);

    // [step 2] Update the password.
    const result = await this.update({
      where: {id: userId},
      data: {passwordHash: hash},
    });
    if (result) {
      return true;
    } else {
      // [Mark] Update password failed. We need to investgate.
      return false;
    }
  }

  /* End */
}
