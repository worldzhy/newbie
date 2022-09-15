import {Injectable} from '@nestjs/common';
import {VerificationCodeService} from '../../verification-code/verification-code.service';
import {UserService} from '../../user/user.service';
import {verifyEmail, verifyPhone} from '../../account.validator';

@Injectable()
export class AuthVerificationCodeService {
  private verificationCodeService = new VerificationCodeService();
  private userService = new UserService();

  /**
   * Validate by verification code
   *
   * @param {string} account can be email or phone.
   * @param {string} verificationCode
   * @returns {(Promise<boolean>)}
   * @memberof VerificationCodeAuthService
   */
  async validateByVerificationCode(
    account: string,
    verificationCode: string
  ): Promise<boolean> {
    // [step 1] Get the user.
    const user = await this.userService.findByAccount(account);
    if (!user) {
      // The user does not exist.
      return false;
    }

    // [step 2] Validate verification code.
    if (verifyEmail(account)) {
      return await this.verificationCodeService.validateWithEmail(
        verificationCode,
        account
      );
    } else if (verifyPhone(account)) {
      return await this.verificationCodeService.validateWithPhone(
        verificationCode,
        account
      );
    } else {
      return false;
    }
  }
}
