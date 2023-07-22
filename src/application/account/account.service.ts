import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {UserStatus, UserTokenStatus, VerificationCodeUse} from '@prisma/client';
import {UserService} from '../../microservices/user/user.service';
import {UserTokenService} from '../../microservices/user/token/token.service';
import {VerificationCodeService} from '../../microservices/verification-code/verification-code.service';
import {EmailNotificationService} from '../../microservices/notification/email/email.service';
import {SmsNotificationService} from '../../microservices/notification/sms/sms.service';
import {TokenService} from '../../toolkit/token/token.service';

@Injectable()
export class AccountService {
  constructor(
    private readonly userService: UserService,
    private readonly userTokenService: UserTokenService,
    private readonly tokenService: TokenService,
    private readonly verificationCodeService: VerificationCodeService,
    private readonly emailNotificationService: EmailNotificationService,
    private readonly smsNotificationService: SmsNotificationService
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
    await this.userTokenService.updateMany({
      where: {userId: user.id},
      data: {status: UserTokenStatus.INACTIVE},
    });

    // [step 4] Update last login time.
    await this.userService.update({
      where: {id: user.id},
      data: {lastLoginAt: new Date()},
    });

    // [step 5] Generate a new JSON web token.
    const token = this.tokenService.sign({userId: user.id, sub: account});
    return await this.userTokenService.create({
      data: {userId: user.id, token: token},
    });
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
