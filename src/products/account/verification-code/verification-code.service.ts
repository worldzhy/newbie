import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../../_prisma/_prisma.service';
import {
  VerificationCode,
  VerificationCodeStatus,
  VerificationCodeUse,
} from '@prisma/client';
import * as validator from '../account.validator';
import * as util from '../../../_util/_util';
import {EmailService} from '../../../microservices/notification/email/email.service';
import {SmsService} from '../../../microservices/notification/sms/sms.service';

@Injectable()
export class VerificationCodeService {
  // Todo: We do not support inactivate verification code automatically now.

  private prisma = new PrismaService();
  private emailService = new EmailService();
  private smsService = new SmsService();

  async send2Email(
    email: string,
    use: VerificationCodeUse
  ): Promise<VerificationCode | {err: {message: string}}> {
    if (!email || !validator.verifyEmail(email)) {
      return {err: {message: 'Invalid parameters.'}};
    }

    // [step 1] Return verification code generated within 1 minute.
    const validCode = await this.prisma.verificationCode.findFirst({
      where: {
        email: email,
        status: VerificationCodeStatus.ACTIVE,
        expiredAt: {gte: util.nowPlusMinutes(4)},
      },
    });
    if (validCode) {
      return validCode;
    }

    // [step 2] Inactive current valid verification codes.
    await this.prisma.verificationCode.updateMany({
      where: {AND: {email: email, status: VerificationCodeStatus.ACTIVE}},
      data: {status: VerificationCodeStatus.INACTIVE},
    });

    // [step 3] Generate and send verification code.
    const newCode = util.randomCode(6);
    // await this.emailService.sendOne({
    //   email: email,
    //   subject: 'Your Verification Code',
    //   plainText: newCode,
    //   html: newCode,
    // });

    // [step 4] Save the code in database.
    return await this.prisma.verificationCode.create({
      data: {
        email: email,
        code: newCode,
        use: use,
        status: VerificationCodeStatus.ACTIVE,
        expiredAt: util.nowPlusMinutes(5), // 5 minutes validity
      },
    });
  }

  async send2Phone(
    phone: string,
    use: VerificationCodeUse
  ): Promise<VerificationCode | {err: {message: string}}> {
    if (!phone || !validator.verifyEmail(phone)) {
      return {err: {message: 'Invalid parameters.'}};
    }

    // [step 1] Return verification code generated within 1 minute.
    const validCode = await this.prisma.verificationCode.findFirst({
      where: {
        phone: phone,
        status: VerificationCodeStatus.ACTIVE,
        expiredAt: {gte: util.nowPlusMinutes(4)},
      },
    });
    if (validCode) {
      return validCode;
    }

    // [step 2] Inactive current valid verification codes.
    await this.prisma.verificationCode.updateMany({
      where: {AND: {phone: phone, status: VerificationCodeStatus.ACTIVE}},
      data: {status: VerificationCodeStatus.INACTIVE},
    });

    // [step 3] Generate and send verification code.
    const newCode = util.randomCode(6);
    // await this.smsService.sendOne({
    //   phone: phone,
    //   text: newCode,
    // });

    // [step 4] Save the code in database.
    return await this.prisma.verificationCode.create({
      data: {
        phone: phone,
        code: newCode,
        use: use,
        status: VerificationCodeStatus.ACTIVE,
        expiredAt: util.nowPlusMinutes(5), // 5 minutes validity
      },
    });
  }

  async validateWithEmail(code: string, email: string): Promise<boolean> {
    // [step 1] Guard statement.
    if (!email || !validator.verifyEmail(email)) {
      return false;
    }

    // [step 2] Check if the verification code is valid.
    const existedCode = await this.prisma.verificationCode.findFirst({
      where: {
        email: email,
        code: code,
        status: VerificationCodeStatus.ACTIVE,
        expiredAt: {
          gte: new Date(),
        },
      },
    });

    return existedCode ? true : false;
  }

  async validateWithPhone(code: string, phone: string): Promise<boolean> {
    // [step 1] Guard statement.
    if (!phone && !validator.verifyPhone(phone)) {
      return false;
    }

    // [step 2] Check if the verification code is valid.
    const existedCode = await this.prisma.verificationCode.findFirst({
      where: {
        phone: phone,
        code: code,
        status: VerificationCodeStatus.ACTIVE,
        expiredAt: {
          gte: new Date(),
        },
      },
    });

    return existedCode ? true : false;
  }
}
