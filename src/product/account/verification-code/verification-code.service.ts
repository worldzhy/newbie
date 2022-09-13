import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../../_prisma/_prisma.service';
import {
  VerificationCode,
  VerificationCodeStatus,
  VerificationCodeUse,
} from '@prisma/client';
import * as validator from '../../../_validator/_account.validator';
import {CommonUtil} from '../../../_util/_common.util';

@Injectable()
export class VerificationCodeService {
  private prisma = new PrismaService();

  /**
   * Check if a verification code exists and is active.
   *
   * @param {string} code
   * @returns
   * @memberof VerificationCodeService
   */
  async checkExistence(code: string) {
    const verificationCode = this.prisma.verificationCode.findFirst({
      where: {code: code, status: VerificationCodeStatus.ACTIVE},
    });
    if (verificationCode !== null) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Generate a verification code
   *
   * @param {{
   *     userId?: string;
   *     email?: string;
   *     phone?: string;
   *     use: string;
   *   }} account
   * @returns
   * @memberof VerificationCodeService
   */
  async generate(account: {
    userId?: string;
    email?: string;
    phone?: string;
    use: VerificationCodeUse;
  }) {
    const {userId, email, phone, use} = account;

    // [step 1: start] Check if there is already valid verification code for this account.
    let existedCode: VerificationCode | null;
    if (userId) {
      existedCode = await this.prisma.verificationCode.findFirst({
        where: {
          userId: account.userId,
          status: VerificationCodeStatus.ACTIVE,
          expiredAt: {gte: CommonUtil.nowPlusMinutes(4)},
        },
      });
    } else if (email && validator.verifyEmail(email)) {
      existedCode = await this.prisma.verificationCode.findFirst({
        where: {
          email: account.email,
          status: VerificationCodeStatus.ACTIVE,
          expiredAt: {gte: CommonUtil.nowPlusMinutes(4)},
        },
      });
    } else if (phone && validator.verifyPhone(phone)) {
      existedCode = await this.prisma.verificationCode.findFirst({
        where: {
          phone: account.phone,
          status: VerificationCodeStatus.ACTIVE,
          expiredAt: {gte: CommonUtil.nowPlusMinutes(4)},
        },
      });
    } else {
      return {
        data: null,
        err: {
          message: 'Invalid parameters.',
        },
      };
    }

    // [step 1: end] Can not generate verification code again within 1 minute.
    if (existedCode) {
      return {
        data: null,
        err: {
          message: 'Can not generate verification code again within 1 minute.',
        },
      };
    }

    // [step 2: start] Generate verification code which is valid for 5 minutes.
    // Totally 1000000 different verification codes
    const code = CommonUtil.randomCode(6);
    const newCode = await this.prisma.verificationCode.create({
      data: {
        userId: userId,
        email: email,
        phone: phone,
        code: code,
        use: use,
        status: VerificationCodeStatus.ACTIVE,
        expiredAt: CommonUtil.nowPlusMinutes(5),
      },
    });

    // [step 2: end]
    return {
      data: newCode,
      err: null,
    };
  }

  /**
   * Validate verification code.
   * [Mark] Currently, we didn't inactivate verification code automatically.
   *
   * @param {{
   *     userId?: string;
   *     email?: string;
   *     phone?: string;
   *     code: string;
   *   }} account
   * @returns {Promise<boolean>}
   * @memberof VerificationCodeService
   */
  async validate(account: {
    userId?: string;
    email?: string;
    phone?: string;
    code: string;
  }): Promise<boolean> {
    const {userId, email, phone, code} = account;

    // [step 1: start] Check if the verification code is valid.
    let existedCode: VerificationCode | null;
    if (userId) {
      existedCode = await this.prisma.verificationCode.findFirst({
        where: {
          userId: userId,
          code: code,
          status: VerificationCodeStatus.ACTIVE,
          expiredAt: {
            gte: new Date(),
          },
        },
      });
    } else if (email && validator.verifyEmail(email)) {
      existedCode = await this.prisma.verificationCode.findFirst({
        where: {
          email: email,
          code: code,
          status: VerificationCodeStatus.ACTIVE,
          expiredAt: {
            gte: new Date(),
          },
        },
      });
    } else if (phone && validator.verifyPhone(phone)) {
      existedCode = await this.prisma.verificationCode.findFirst({
        where: {
          phone: phone,
          code: code,
          status: VerificationCodeStatus.ACTIVE,
          expiredAt: {
            gte: new Date(),
          },
        },
      });
    } else {
      return false;
    }

    // [step 1: end]
    if (existedCode) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Inactivate a verification code.
   *
   * @param {string} userId
   * @param {string} code
   * @returns
   * @memberof VerificationCodeService
   */
  async inactivate(userId: string, code: string) {
    const result = await this.prisma.verificationCode.updateMany({
      where: {
        userId: userId,
        code: code,
      },
      data: {status: VerificationCodeStatus.INACTIVE},
    });
    if (result.count > 0) {
      return true;
    } else {
      return false;
    }
  }
}
