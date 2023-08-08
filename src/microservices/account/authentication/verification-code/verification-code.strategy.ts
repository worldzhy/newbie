import {Strategy} from 'passport-local';
import {PassportStrategy} from '@nestjs/passport';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {VerificationCodeService} from '@microservices/verification-code/verification-code.service';
import {UserService} from '@microservices/account/user/user.service';
import {verifyEmail, verifyPhone} from '@toolkit/validators/user.validator';
import {
  IpLoginAttemptService,
  UserLoginAttemptService,
} from '@microservices/account/security/login-attempt/login-attempt.service';
import {Request} from 'express';

@Injectable()
export class AuthVerificationCodeStrategy extends PassportStrategy(
  Strategy,
  'passport-local.verification-code'
) {
  constructor(
    private readonly verificationCodeService: VerificationCodeService,
    private readonly userService: UserService,
    private readonly ipLoginAttemptService: IpLoginAttemptService,
    private readonly userLoginAttemptService: UserLoginAttemptService
  ) {
    super({
      usernameField: 'account',
      passwordField: 'verificationCode',
      passReqToCallback: true,
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
  async validate(
    req: Request,
    account: string,
    verificationCode: string
  ): Promise<boolean> {
    const ipAddress = req.socket.remoteAddress as string;

    // [step 1] Get the user.
    const user = await this.userService.findByAccount(account);
    if (!user) {
      await this.ipLoginAttemptService.increment(ipAddress);
      throw new UnauthorizedException('The user does not exist.');
    }

    // [step 2] Check if user is allowed to login.
    const isUserAllowed = await this.userLoginAttemptService.isAllowed(user.id);
    if (!isUserAllowed) {
      throw new ForbiddenException('Forbidden resource');
    }

    // [step 3] Handle invalid account situation.
    if (!verifyEmail(account) && !verifyPhone(account)) {
      await this.userLoginAttemptService.delete(user.id);
      throw new UnauthorizedException('Invalid account.');
    }

    // [step 4] Validate verification code.
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
      await this.userLoginAttemptService.increment(user.id);
      return false;
    }

    // [Step 5] OK.
    await this.userLoginAttemptService.delete(user.id);
    return true;
  }
}
