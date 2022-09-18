import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../../toolkits/prisma/prisma.service';
import {
  Prisma,
  VerificationCode,
  VerificationCodeStatus,
  VerificationCodeUse,
} from '@prisma/client';
import * as util from '../../../toolkits/utilities/common.util';

// Todo: We do not support inactivate verification code automatically now.

@Injectable()
export class VerificationCodeService {
  private prisma = new PrismaService();

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

  async generateForPhone(
    phone: string,
    use: VerificationCodeUse
  ): Promise<VerificationCode> {
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

  async validateForEmail(code: string, email: string): Promise<boolean> {
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
