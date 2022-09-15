import {Strategy} from 'passport-local';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable, UnauthorizedException} from '@nestjs/common';
import {AuthVerificationCodeService} from './auth-verification-code.service';

@Injectable()
export class AuthVerificationCodeStrategy extends PassportStrategy(
  Strategy,
  'local.verification-code'
) {
  constructor(
    private authVerificationCodeService: AuthVerificationCodeService
  ) {
    super({
      usernameField: 'account',
      passwordField: 'verificationCode',
    });
  }

  /**
   * 'vaidate' function must be implemented.
   *
   * The 'account' parameter accepts:
   * [1] email
   * [2] phone
   *
   * @param {string} account
   * @param {string} verificationCode
   * @returns {(Promise<{data: object | null; err: object | null}>)}
   * @memberof VerificationCodeStrategy
   */
  async validate(account: string, verificationCode: string): Promise<boolean> {
    const result =
      await this.authVerificationCodeService.validateByVerificationCode(
        account,
        verificationCode
      );
    if (!result) {
      throw new UnauthorizedException(result);
    } else {
      return true;
    }
  }
}