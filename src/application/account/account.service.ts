import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {UserStatus, VerificationCodeUse} from '@prisma/client';
import {UserService} from './user/user.service';
import {UserAccessTokenService} from './user/accessToken/accessToken.service';
import {VerificationCodeService} from '../../microservices/verification-code/verification-code.service';
import {EmailNotificationService} from '../../microservices/notification/email/email.service';
import {SmsNotificationService} from '../../microservices/notification/sms/sms.service';
import {
  AccessTokenService,
  RefreshTokenService,
} from '../../toolkit/token/token.service';
import {UserRefreshTokenService} from './user/refreshToken/refreshToken.service';
import {getSecondsUntilunixTimestamp} from 'src/toolkit/utilities/date.util';

@Injectable()
export class AccountService {
  private userService = new UserService();
  private userAccessTokenService = new UserAccessTokenService();
  private accessTokenService = new AccessTokenService();
  private userRefreshTokenService = new UserRefreshTokenService();
  private refreshTokenService = new RefreshTokenService();
  private verificationCodeService = new VerificationCodeService();
  private emailNotificationService = new EmailNotificationService();
  private smsNotificationService = new SmsNotificationService();

  async login(account: string) {
    // [step 1] Get user.
    const user = await this.userService.findByAccount(account);
    if (!user) {
      throw new NotFoundException('Your account does not exist.');
    }

    // [step 2] Check if the account is active.
    if (user.status === UserStatus.INACTIVE) {
      throw new NotFoundException(
        'You have closed your account, do you want to recover it?'
      );
    }

    // [step 3] Disable active JSON web token if existed.
    await this.invalidateTokens(user.id);

    // [step 4] Update last login time.
    await this.userService.update({
      where: {id: user.id},
      data: {lastLoginAt: new Date()},
    });

    // [step 5] Generate new tokens.
    return await this.generateTokens(user.id, account);
  }

  async invalidateTokens(userId: string) {
    await Promise.all([
      this.userAccessTokenService.deleteMany({
        where: {userId},
      }),
      this.userRefreshTokenService.deleteMany({
        where: {userId},
      }),
    ]);
  }

  async generateTokens(
    userId: string,
    sub: string,
    opt?: {refreshTokenExpiryUnix: number}
  ) {
    // [step 1] Generate JWT payload
    const jwtPayload = {
      userId: userId,
      sub: sub,
    };

    // [step 2] Set refresh token options.
    const refreshTokenOptions = {
      // If refreshTokenExpiryUnix has value, use it to calculte the expiry. Otherwise, use default expiry (24 hours).
      ...(opt?.refreshTokenExpiryUnix && {
        expiresIn: getSecondsUntilunixTimestamp(opt?.refreshTokenExpiryUnix),
      }),
    };

    // [step 3] Generate tokens
    const [accessToken, refreshToken] = await Promise.all([
      this.userAccessTokenService.create({
        data: {
          userId: userId,
          token: this.accessTokenService.sign(jwtPayload),
        },
      }),
      this.userRefreshTokenService.create({
        data: {
          userId: userId,
          token: this.refreshTokenService.sign(jwtPayload, refreshTokenOptions),
        },
      }),
    ]);

    return {
      accessToken,
      refreshToken: {
        ...refreshToken,
        name: this.refreshTokenService.cookieName,
        cookieConfig: this.refreshTokenService.getCookieConfig(
          refreshToken.token
        ),
      },
    };
  }

  // *
  // * Won't send message if the same email apply again within 1 minute.
  // *
  async sendVerificationCode(params: {
    email?: string;
    phone?: string;
    use: VerificationCodeUse;
  }): Promise<boolean> {
    if (params.email) {
      // [step 1] Check if the account exists.
      const user = await this.userService.findByAccount(params.email);
      if (!user) {
        throw new NotFoundException('Your account is not registered.');
      }

      // [step 2] Generate verification code.
      const verificationCode =
        await this.verificationCodeService.generateForEmail(
          params.email,
          params.use
        );

      // [step 3] Send verification code.
      await this.emailNotificationService.sendEmail({
        email: params.email,
        subject: 'Your Verificaiton Code',
        plainText:
          verificationCode.code +
          ' is your verification code valid for the next 10 minutes.',
        html:
          verificationCode.code +
          ' is your verification code valid for the next 10 minutes.',
      });
    } else if (params.phone) {
      // [step 1] Check if the account exists.
      const user = await this.userService.findByAccount(params.phone);
      if (!user) {
        throw new NotFoundException('Your account is not registered.');
      }

      // [step 2] Generate verification code.
      const verificationCode =
        await this.verificationCodeService.generateForPhone(
          params.phone,
          params.use
        );

      // [step 3] Send verification code.
      await this.smsNotificationService.sendTextMessage({
        phone: params.phone,
        text: verificationCode.code,
      });
    } else {
      throw new BadRequestException('The email or phone is invalid.');
    }

    return true;
  }

  /* End */
}
