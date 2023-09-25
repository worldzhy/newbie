import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {UserStatus, VerificationCodeUse} from '@prisma/client';
import {VerificationCodeService} from '@microservices/account/verification-code/verification-code.service';
import {NotificationService} from '@microservices/notification/notification.service';
import {AccessTokenService} from '@microservices/token/access-token/access-token.service';
import {RefreshTokenService} from '@microservices/token/refresh-token/refresh-token.service';
import {getSecondsUntilunixTimestamp} from '@toolkit/utilities/datetime.util';
import {UserService} from '@microservices/account/user/user.service';

@Injectable()
export class AccountService {
  constructor(
    private readonly userService: UserService,
    private readonly accessTokenService: AccessTokenService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly verificationCodeService: VerificationCodeService,
    private readonly notificationService: NotificationService
  ) {}

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
      this.accessTokenService.deleteMany({
        where: {userId},
      }),
      this.refreshTokenService.deleteMany({
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
      this.accessTokenService.create({
        data: {
          userId: userId,
          token: this.accessTokenService.sign(jwtPayload),
        },
      }),
      this.refreshTokenService.create({
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
      await this.notificationService.sendEmail({
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
      await this.notificationService.sendSms({
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
