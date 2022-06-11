import {Injectable} from '@nestjs/common';
import {UserService} from '../../user/user.service';

const bcrypt = require('bcrypt');

@Injectable()
export class AuthPasswordService {
  private userService = new UserService();

  /**
   * Entry of the verification is in '_local.strategy.ts'.
   *
   * @param {string} account accepts 'username', 'email' and 'phone'.
   * @param {string} password
   * @returns {Promise<any>}
   * @memberof AuthService
   */
  async validateByPassword(
    account: string,
    password: string
  ): Promise<{data: object | null; err: object | null}> {
    // [step 1] Get the user.
    const user = await this.userService.findByAccount(account);
    if (!user) {
      // The user does not exist.
      return {
        data: null,
        err: {message: 'The user is not existed.'},
      };
    }

    // [step 2] Validate password.
    const match = await bcrypt.compare(password, user.passwordHash);
    if (match === true) {
      return {
        data: user,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'The password is incorrect.'},
      };
    }
  }

  /* End */
}
