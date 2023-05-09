import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../toolkits/prisma/prisma.service';
import {
  Prisma,
  VerificationCode,
  VerificationCodeStatus,
  VerificationCodeUse,
} from '@prisma/client';
import * as util from '../../toolkits/utilities/common.util';

// Todo: We do not support inactivate verification code automatically now.

@Injectable()
export class VerificationCodeService {
  private prisma = new PrismaService();
  private timeoutAfter = 10; // The verification code will be invalid after 10 minutes.
  private resendAfter = 1; // The verification code can be resend after 1 minute.

  async findUnique(
    params: Prisma.VerificationCodeFindUniqueArgs
  ): Promise<VerificationCode | null> {
    return await this.prisma.verificationCode.findUnique(params);
  }

  async findMany(
    params: Prisma.VerificationCodeFindManyArgs
  ): Promise<VerificationCode[]> {
    return await this.prisma.verificationCode.findMany(params);
  }

  async create(
    params: Prisma.VerificationCodeCreateArgs
  ): Promise<VerificationCode> {
    return await this.prisma.verificationCode.create(params);
  }

  async update(
    params: Prisma.VerificationCodeUpdateArgs
  ): Promise<VerificationCode> {
    return await this.prisma.verificationCode.update(params);
  }

  async delete(
    params: Prisma.VerificationCodeDeleteArgs
  ): Promise<VerificationCode> {
    return await this.prisma.verificationCode.delete(params);
  }

  async generateForEmail(
    email: string,
    use: VerificationCodeUse
  ): Promise<VerificationCode> {
    // [step 1] Return verification code generated within 1 minute.
    const validCode = await this.prisma.verificationCode.findFirst({
      where: {
        email: {equals: email, mode: 'insensitive'},
        status: VerificationCodeStatus.ACTIVE,
        expiredAt: {
          gte: util.nowPlusMinutes(this.timeoutAfter - this.resendAfter),
        },
      },
    });
    if (validCode) {
      return validCode;
    }

    // [step 2] Inactive current valid verification codes.
    await this.prisma.verificationCode.updateMany({
      where: {
        AND: {
          email: {equals: email, mode: 'insensitive'},
          status: VerificationCodeStatus.ACTIVE,
        },
      },
      data: {status: VerificationCodeStatus.INACTIVE},
    });

    // [step 3] Generate and send verification code.
    const newCode = util.generateRandomNumbers(6);
    return await this.prisma.verificationCode.create({
      data: {
        email: email,
        code: newCode,
        use: use,
        status: VerificationCodeStatus.ACTIVE,
        expiredAt: util.nowPlusMinutes(this.timeoutAfter),
      },
    });
  }

  async generateForPhone(
    phone: string,
    use: VerificationCodeUse
  ): Promise<VerificationCode> {
    // [step 1] Return verification code generated within 1 minute.
    const validCode = await this.prisma.verificationCode.findFirst({
      where: {
        phone: phone,
        status: VerificationCodeStatus.ACTIVE,
        expiredAt: {
          gte: util.nowPlusMinutes(this.timeoutAfter - this.resendAfter),
        },
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
    const newCode = util.generateRandomNumbers(6);

    // [step 4] Save the code in database.
    return await this.prisma.verificationCode.create({
      data: {
        phone: phone,
        code: newCode,
        use: use,
        status: VerificationCodeStatus.ACTIVE,
        expiredAt: util.nowPlusMinutes(this.timeoutAfter),
      },
    });
  }

  async validateForEmail(code: string, email: string): Promise<boolean> {
    const existedCode = await this.prisma.verificationCode.findFirst({
      where: {
        email: {equals: email, mode: 'insensitive'},
        code: code,
        status: VerificationCodeStatus.ACTIVE,
        expiredAt: {
          gte: new Date(),
        },
      },
    });
    return existedCode ? true : false;
  }

  async validateForPhone(code: string, phone: string): Promise<boolean> {
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
