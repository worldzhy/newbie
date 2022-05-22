import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../_prisma/_prisma.service';
import {Prisma, User} from '@prisma/client';
import {Util} from '../../_common/_common.util';

const bcrypt = require('bcrypt');

@Injectable()
export class UserService {
  public readonly prisma: PrismaService = new PrismaService();

  /**
   * Get a user
   *
   * @param {Prisma.UserWhereUniqueInput} userWhereUniqueInput
   * @returns {(Promise<User | null>)}
   * @memberof UserService
   */
  async findOne(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput
  ): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      include: {profiles: true},
    });
  }

  /**
   * Get many users
   *
   * @param {{
   *     skip?: number;
   *     take?: number;
   *     where?: Prisma.UserWhereInput;
   *     orderBy?: Prisma.UserOrderByWithRelationAndSearchRelevanceInput;
   *     select?: Prisma.UserSelect;
   *   }} params
   * @returns
   * @memberof UserService
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationAndSearchRelevanceInput;
    select?: Prisma.UserSelect;
  }) {
    const {skip, take, where, orderBy, select} = params;
    return await this.prisma.user.findMany({
      skip,
      take,
      where,
      orderBy,
      select,
    });
  }

  /**
   * Get a user by username / email / phone.
   *
   * @param {string} account can be username, email, or phone.
   * @returns {(Promise<User | null>)}
   * @memberof UserService
   */
  async findByAccount(account: string): Promise<User | null> {
    const users = await this.findMany({
      where: {
        OR: [{username: account}, {email: account}, {phone: account}],
      },
    });
    console.log(account);
    if (users.length > 0) {
      return users[0] as User;
    } else {
      return null;
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
   * Create a user
   *
   * @param {Prisma.UserCreateInput} data
   * @returns {Promise<User>}
   * @memberof UserService
   */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return await this.prisma.user.create({
      data,
    });
  }

  /**
   * Update a user
   *
   * @param {{
   *     where: Prisma.UserWhereUniqueInput;
   *     data: Prisma.UserUpdateInput;
   *   }} params
   * @returns {Promise<User>}
   * @memberof UserService
   */
  async update(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const {where, data} = params;
    return await this.prisma.user.update({
      data,
      where,
    });
  }

  /**
   * Delete a user
   *
   * @param {Prisma.UserWhereUniqueInput} where
   * @returns {Promise<User>}
   * @memberof UserService
   */
  async delete(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return await this.prisma.user.delete({
      where,
    });
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
    const user = await this.findOne({id: userId});
    if (!user) {
      return false;
    }

    // [step 2] Verify the current password.
    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (match === false) {
      return false;
    }

    // [step 3] Generate the new password hash.
    const hash = await Util.generateHash(newPassword);

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
    const hash = await Util.generateHash(newPassword);

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
