import {Strategy} from 'passport-local';
import {PassportStrategy} from '@nestjs/passport';
import {Injectable, UnauthorizedException} from '@nestjs/common';
import {VerificationCodeService} from '../../../../microservices/verification-code/verification-code.service';
import {UserService} from '../../user/user.service';
import {
  verifyEmail,
  verifyPhone,
} from '../../../../toolkits/validators/user.validator';

@Injectable()
export class AuthVerificationCodeStrategy extends PassportStrategy(
  Strategy,
  'passport-local.verification-code'
) {
  private verificationCodeService = new VerificationCodeService();
  private userService = new UserService();

  constructor() {
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
   */
  async validate(account: string, verificationCode: string): Promise<boolean> {
    // [step 1] Get the user.
    const user = await this.userService.findByAccount(account);
    if (!user) {
      throw new UnauthorizedException('The user does not exist.');
    }

    // [step 2] Validate verification code.
    if (verifyEmail(account)) {
      return await this.verificationCodeService.validateForEmail(
        verificationCode,
        account
      );
    } else if (verifyPhone(account)) {
      return await this.verificationCodeService.validateForPhone(
        verificationCode,
        account
      );
    } else {
      throw new UnauthorizedException('Invalid account.');
    }
  }
}
