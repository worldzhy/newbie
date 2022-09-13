import {Injectable} from '@nestjs/common';
import {AuthJwtService} from './auth/auth-jwt/auth-jwt.service';
import {UserService} from './user/user.service';
import {UserStatus} from '@prisma/client';
import {generateHash} from '../../_util/_util';

@Injectable()
export class AccountService {
  private userService = new UserService();
  private authJwtService = new AuthJwtService();

  /**
   * Sign up via:
   * [1] username
   * [2] email
   * [3] phone
   *
   * [Constraint] 'password' is required if neither email nor phone is provided.
   *
   * @param {{
   *     username?: string;
   *     password?: string;
   *     email?: string;
   *     phone?: string;
   *   }} signupUser
   * @returns
   * @memberof AccountService
   */
  async signup(signupUser: {
    username?: string;
    password?: string;
    email?: string;
    phone?: string;
    profile?: object;
  }) {
    // [step 1] Generate password hash if needed.
    let passwordHash: string | null | undefined;
    if (signupUser.password) {
      passwordHash = await generateHash(signupUser.password);
    }

    // [step 2] Create new user.
    const user = await this.userService.create({
      username: signupUser.username,
      passwordHash: passwordHash,
      email: signupUser.email,
      phone: signupUser.phone,
      status: UserStatus.ACTIVE,
      profiles: {create: {...signupUser.profile}},
    });
    if (user) {
      // Return user info except passwordHash, createdAt, updatedAt
      const {passwordHash, createdAt, updatedAt, ...others} = user;
      return others;
    } else {
      return null;
    }
  }

  /**
   * After a user is verified by auth guard, this 'login' function returns
   * a JWT to declare the user is authenticated.
   *
   * The 'account' parameter accepts:
   * [1] id
   * [2] username
   * [3] email
   * [4] phone
   *
   * @param {string} account
   * @returns
   * @memberof AccountService
   */
  async login(account: string) {
    // [step 1] Get user.
    const user = await this.userService.findByAccount(account);
    if (!user) {
      return {
        data: null,
        err: {
          message: 'Your account does not exist.',
        },
      };
    }

    // [step 2] Check if the account is active.
    if (user.status === UserStatus.INACTIVE) {
      return {
        data: null,
        err: {
          message: 'You have closed your account, do you want to recover it?',
        },
      };
    }

    // [step 3] Disable active JSON web token if existed.
    await this.authJwtService.inactivateJWTs(user.id);

    // [step 4] Generate a new JSON web token.
    const jwt = await this.authJwtService.createJWT({
      userId: user.id,
      sub: account,
    });
    if (!jwt) {
      return {
        data: null,
        err: {
          message: 'Your login process has failed. Please try again later.',
        },
      };
    }

    // [step 5] Update last login time.
    await this.userService.update({
      where: {
        id: user.id,
      },
      data: {
        lastLoginAt: new Date(),
      },
    });

    return {
      data: {
        userId: user.id,
        token: jwt.token,
      },
      err: null,
    };
  }

  /**
   * Log out
   *
   * @param {string} userId
   * @param {string} accessToken
   * @returns
   * @memberof AccountService
   */
  async logout(userId: string, accessToken: string) {
    // Returns the count of updated records
    await this.authJwtService.inactivateJWT(userId, accessToken);
  }

  /**
   * Close account
   *
   * @param {string} account accepts [1]email [2]phone
   * @memberof AccountService
   */
  async close(account: string) {
    // [step 1] Get user.
    const user = await this.userService.findByAccount(account);
    if (!user) {
      return {
        data: null,
        err: {message: 'The account does not exist.'},
      };
    }

    // [step 2] Check if the account is active.
    if (user.status === UserStatus.INACTIVE) {
      return {
        data: null,
        err: {message: 'Your account has already been closed before.'},
      };
    }

    // [step 3] Close account.
    await this.userService.update({
      where: {
        id: user.id,
      },
      data: {status: UserStatus.INACTIVE},
    });

    // [step 4] Inactivate other resources.
    // ...
  }

  /**
   * Recover account
   *
   * @param {string} account accepts [1]email [2]phone
   * @memberof AccountService
   */
  async recover(account: string) {
    // [step 1] Get user.
    const user = await this.userService.findByAccount(account);
    if (!user) {
      return {
        data: null,
        err: {message: 'The account does not exist.'},
      };
    }

    // [step 2] Check if the account is closed.
    if (user.status === UserStatus.ACTIVE) {
      return {
        data: null,
        err: {message: 'You can not recover an active account.'},
      };
    }

    // [step 3] Recover account.
    const result = await this.userService.update({
      where: {
        id: user.id,
      },
      data: {status: UserStatus.ACTIVE},
    });

    // [step 4] Activate other resources.
    // ...

    if (result) {
      return {
        data: {message: 'Your account has been recovered.'},
        err: null,
      };
    } else {
      return {
        data: null,
        err: {
          message: 'Your recovery process has failed. Please try again later.',
        },
      };
    }
  }

  /* End */
}
