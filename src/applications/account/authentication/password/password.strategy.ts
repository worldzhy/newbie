import {Injectable, UnauthorizedException} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {Strategy} from 'passport-local';
import {compareHash} from 'src/toolkits/utilities/common.util';
import {UserService} from '../../user/user.service';

@Injectable()
export class AuthPasswordStrategy extends PassportStrategy(
  Strategy,
  'passport-local.password'
) {
  private userService = new UserService();

  constructor() {
    super({usernameField: 'account', passwordField: 'password'});
  }

  /**
   * 'vaidate' function must be implemented.
   *
   * The 'account' parameter accepts:
   * [1] username
   * [2] email
   * [3] phone
   *
   */
  async validate(account: string, password: string): Promise<boolean> {
    // [step 1] Get the user.
    const user = await this.userService.findByAccount(account);
    if (!user) {
      throw new UnauthorizedException('The user is not existed.');
    }

    // [step 2] Validate password.
    const match = await compareHash(password, user.password);
    if (match === true) {
      return true;
    } else {
      throw new UnauthorizedException('The password is incorrect.');
    }
  }
}
