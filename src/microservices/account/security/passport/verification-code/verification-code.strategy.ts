import {Injectable, UnauthorizedException} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {Strategy} from 'passport-local';
import {VerificationCodeService} from '@microservices/account/verification-code/verification-code.service';
import {UserService} from '@microservices/account/user/user.service';
import {verifyEmail, verifyPhone} from '@toolkit/validators/user.validator';

@Injectable()
export class VerificationCodeStrategy extends PassportStrategy(
  Strategy,
  'local.verification-code'
) {
  constructor(
    private readonly verificationCodeService: VerificationCodeService,
    private readonly userService: UserService
  ) {
    super({usernameField: 'account', passwordField: 'verificationCode'});
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

    // [step 2] Handle invalid account situation.
    if (!verifyEmail(account) && !verifyPhone(account)) {
      throw new UnauthorizedException('Invalid account.');
    }

    // [step 3] Validate verification code.
    const isCodeValid = verifyEmail(account)
      ? await this.verificationCodeService.validateForEmail(
          verificationCode,
          account
        )
      : await this.verificationCodeService.validateForPhone(
          verificationCode,
          account
        );
    if (!isCodeValid) {
      return false;
    }

    // [Step 4] OK.
    return true;
  }
}
