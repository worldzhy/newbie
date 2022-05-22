import {Strategy} from 'passport-local';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable, UnauthorizedException} from '@nestjs/common';
import {AuthVerificationCodeService} from './_auth-verification-code.service';

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
   * The 'account' parameter accepts:
   * [1] username
   * [2] email
   * [3] phone
   *
   * @param {string} acount
   * @param {string} verificationCode
   * @returns {(Promise<{data: object | null; err: object | null}>)}
   * @memberof VerificationCodeStrategy
   */
  async validate(
    account: string,
    verificationCode: string
  ): Promise<{data: object | null; err: object | null}> {
    const result =
      await this.authVerificationCodeService.validateByVerificationCode(
        account,
        verificationCode
      );
    if (result.data && !result.err) {
      return result;
    } else {
      throw new UnauthorizedException(result);
    }
  }
}
