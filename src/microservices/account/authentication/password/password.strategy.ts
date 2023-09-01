import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {Strategy} from 'passport-local';
import {compareHash} from '@toolkit/utilities/common.util';
import {UserService} from '@microservices/account/user/user.service';
import {
  SecurityLoginIpAttemptService,
  SecurityLoginUserAttemptService,
} from '@microservices/account/security/login-attempt/login-attempt.service';
import {Request} from 'express';

@Injectable()
export class AuthPasswordStrategy extends PassportStrategy(
  Strategy,
  'passport-local.password'
) {
  constructor(
    private readonly userService: UserService,
    private readonly securityLoginIpAttemptService: SecurityLoginIpAttemptService,
    private readonly securityLoginUserAttemptService: SecurityLoginUserAttemptService
  ) {
    super({
      usernameField: 'account',
      passwordField: 'password',
      passReqToCallback: true,
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
   */
  async validate(
    req: Request,
    account: string,
    password: string
  ): Promise<boolean> {
    const ipAddress = req.socket.remoteAddress as string;

    // [step 1] Get the user.
    const user = await this.userService.findByAccount(account);
    if (!user) {
      await this.securityLoginIpAttemptService.increment(ipAddress);
      throw new UnauthorizedException(
        'Invalid combination of username and password.'
      );
    }

    // [step 2] Check if user is allowed to login.
    const isUserAllowed = await this.securityLoginUserAttemptService.isAllowed(
      user.id
    );
    if (!isUserAllowed) {
      throw new ForbiddenException('Forbidden resource');
    }

    // [step 3] Handle no password situation.
    if (!user.password) {
      throw new UnauthorizedException(
        'The password has not been set. Please login via verification code.'
      );
    }

    // [step 4] Validate password.
    const match = await compareHash(password, user.password);
    if (match !== true) {
      await this.securityLoginUserAttemptService.increment(user.id);
      throw new UnauthorizedException(
        'Invalid combination of username and password.'
      );
    }

    // [step 5] OK.
    await this.securityLoginUserAttemptService.delete(user.id);
    return true;
  }
}
