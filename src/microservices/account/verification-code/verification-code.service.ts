import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {
  Prisma,
  VerificationCode,
  VerificationCodeStatus,
  VerificationCodeUse,
} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {currentPlusMinutes} from '@toolkit/utilities/datetime.util';
import {generateRandomNumbers} from '@toolkit/utilities/common.util';

// Todo: We do not support inactivate verification code automatically now.

@Injectable()
export class VerificationCodeService {
  private timeoutMinutes: number; // The verification code will be invalid after x minutes.
  private resendMinutes: number; // The verification code can be resend after y minute.

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {
    this.timeoutMinutes = this.configService.getOrThrow<number>(
      'microservice.account.verificationCode.timeoutMinutes'
    )!;
    this.resendMinutes = this.configService.getOrThrow<number>(
      'microservice.account.verificationCode.resendMinutes'
    )!;
  }

  async findUniqueOrThrow(
    args: Prisma.VerificationCodeFindUniqueArgs
  ): Promise<VerificationCode> {
    return await this.prisma.verificationCode.findUniqueOrThrow(args);
  }

  async findMany(
    args: Prisma.VerificationCodeFindManyArgs
  ): Promise<VerificationCode[]> {
    return await this.prisma.verificationCode.findMany(args);
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.VerificationCodeFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.VerificationCode,
      pagination,
      findManyArgs,
    });
  }

  async create(
    args: Prisma.VerificationCodeCreateArgs
  ): Promise<VerificationCode> {
    return await this.prisma.verificationCode.create(args);
  }

  async update(
    args: Prisma.VerificationCodeUpdateArgs
  ): Promise<VerificationCode> {
    return await this.prisma.verificationCode.update(args);
  }

  async delete(
    args: Prisma.VerificationCodeDeleteArgs
  ): Promise<VerificationCode> {
    return await this.prisma.verificationCode.delete(args);
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
          gte: currentPlusMinutes(this.timeoutMinutes - this.resendMinutes),
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
    const newCode = generateRandomNumbers(6);
    return await this.prisma.verificationCode.create({
      data: {
        email: email,
        code: newCode,
        use: use,
        status: VerificationCodeStatus.ACTIVE,
        expiredAt: currentPlusMinutes(this.timeoutMinutes),
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
          gte: currentPlusMinutes(this.timeoutMinutes - this.resendMinutes),
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
    const newCode = generateRandomNumbers(6);

    // [step 4] Save the code in database.
    return await this.prisma.verificationCode.create({
      data: {
        phone: phone,
        code: newCode,
        use: use,
        status: VerificationCodeStatus.ACTIVE,
        expiredAt: currentPlusMinutes(this.timeoutMinutes),
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