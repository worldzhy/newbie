import {Strategy} from 'passport-local';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable, UnauthorizedException} from '@nestjs/common';
import {AuthPasswordService} from './auth-password.service';

@Injectable()
export class AuthPasswordStrategy extends PassportStrategy(
  Strategy,
  'local.password'
) {
  constructor(private authPasswordService: AuthPasswordService) {
    super({
      usernameField: 'account',
      passwordField: 'password',
    });
  }

  /**
   * 'vaidate' function must be implemented.
   *
   * The 'account' parameter accepts:
   * [1] username
   * [2] email
   * [3] phone
   *
   * @param {string} account
   * @param {string} password
   * @returns {(Promise<{data: object | null; err: object | null}>)}
   * @memberof PasswordStrategy
   */
  async validate(
    account: string,
    password: string
  ): Promise<{data: object | null; err: object | null}> {
    const result = await this.authPasswordService.validateByPassword(
      account,
      password
    );
    if (result.data && !result.err) {
      return result;
    } else {
      throw new UnauthorizedException(result);
    }
  }
}
