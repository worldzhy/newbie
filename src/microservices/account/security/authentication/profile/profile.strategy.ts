import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {PassportStrategy} from '@nestjs/passport';
import {Strategy} from 'passport-custom';
import {Request} from 'express';
import {
  IpLoginLimiterService,
  UserLoginLimiterService,
} from '@microservices/account/security/login-limiter/login-limiter.service';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class AuthProfileStrategy extends PassportStrategy(
  Strategy,
  'passport-custom.user-profile'
) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly securityLoginIpAttemptService: IpLoginLimiterService,
    private readonly securityLoginUserAttemptService: UserLoginLimiterService
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
    const profiles = await this.prisma.userProfile.findMany({
      where: {firstName, middleName, lastName, suffix, dateOfBirth},
    });
    if (profiles.length !== 1) {
      await this.securityLoginIpAttemptService.increment(ipAddress);
      throw new UnauthorizedException('There are 0 or multiple users.');
    }

    // [step 3] Check if user is allowed to login.
    const userId = profiles[0].userId;
    const isUserAllowed =
      await this.securityLoginUserAttemptService.isAllowed(userId);
    if (!isUserAllowed) {
      throw new ForbiddenException('Forbidden resource');
    }

    // [step 4] OK.
    await this.securityLoginUserAttemptService.delete(userId);
    return true;
  }
}
