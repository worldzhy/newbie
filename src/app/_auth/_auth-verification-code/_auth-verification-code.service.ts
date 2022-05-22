import {Injectable} from '@nestjs/common';
import {VerificationCodeService} from '../../_verification-code/_verification-code.service';
import {UserService} from '../../_user/_user.service';

@Injectable()
export class AuthVerificationCodeService {
  private verificationCodeService = new VerificationCodeService();
  private userService = new UserService();

  /**
   * Validate by verification code
   *
   * @param {*} account can be username, email or phone.
   * @param {string} verificationCode
   * @returns {(Promise<{data: object | null; err: object | null}>)}
   * @memberof VerificationCodeAuthService
   */
  async validateByVerificationCode(
    account: string,
    verificationCode: string
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

    // [step 2] Validate verification code.
    const result = await this.verificationCodeService.validate({
      userId: user.id,
      code: verificationCode,
    });
    if (result) {
      return {
        data: user,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'The verification code is invalid.'},
      };
    }
  }
}
