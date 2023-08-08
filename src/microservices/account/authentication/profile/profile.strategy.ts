import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {Strategy} from 'passport-custom';
import {Request} from 'express';
import {UserProfileService} from '@microservices/account/user/user-profile.service';
import {
  IpLoginAttemptService,
  UserLoginAttemptService,
} from '@microservices/account/security/login-attempt/login-attempt.service';

@Injectable()
export class AuthProfileStrategy extends PassportStrategy(
  Strategy,
  'passport-custom.user-profile'
) {
  constructor(
    private readonly userProfileService: UserProfileService,
    private readonly ipLoginAttemptService: IpLoginAttemptService,
    private readonly userLoginAttemptService: UserLoginAttemptService
  ) {
    super();
  }

  /**
   * 'validate' function must be implemented.
   */
  async validate(req: Request): Promise<boolean> {
    const ipAddress = req.socket.remoteAddress as string;

    // [step 1] Guard statement.
    const profile = req.body;
    const {firstName, middleName, lastName, suffix, dateOfBirth} = profile;
    if ((firstName && middleName && lastName && dateOfBirth) === undefined) {
      throw new UnauthorizedException(
        'The firstName, middleName, lastName and dateOfBirth are required.'
      );
    }

    // [step 2] Get profiles.
    const profiles = await this.userProfileService.findMany({
      where: {firstName, middleName, lastName, suffix, dateOfBirth},
    });
    if (profiles.length !== 1) {
      await this.ipLoginAttemptService.increment(ipAddress);
      throw new UnauthorizedException('There are 0 or multiple users.');
    }

    // [step 3] Check if user is allowed to login.
    const userId = profiles[0].userId;
    const isUserAllowed = await this.userLoginAttemptService.isAllowed(userId);
    if (!isUserAllowed) {
      throw new ForbiddenException('Forbidden resource');
    }

    // [step 4] OK.
    await this.userLoginAttemptService.delete(userId);
    return true;
  }
}
