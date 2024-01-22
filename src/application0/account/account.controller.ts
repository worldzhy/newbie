import {
  Controller,
  Body,
  BadRequestException,
  Post,
  Get,
  Req,
  Patch,
} from '@nestjs/common';
import {ApiTags, ApiBody, ApiBearerAuth} from '@nestjs/swagger';
import {Prisma, VerificationCodeUse} from '@prisma/client';
import {Request} from 'express';
import {AccountService} from '@microservices/account/account.service';
import {VerificationCodeService} from '@microservices/account/verification-code.service';
import {NoGuard} from '@microservices/account/security/passport/public/public.decorator';
import {verifyEmail, verifyPhone} from '@toolkit/validators/user.validator';
import {compareHash} from '@toolkit/utilities/common.util';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@ApiTags('Account')
@Controller('account')
export class AccountController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accountService: AccountService,
    private readonly verificationCodeService: VerificationCodeService
  ) {}

  @Get('me')
  @ApiBearerAuth()
  async getCurrentUser(@Req() request: Request) {
    return await this.accountService.me(request);
  }

  @Patch('me')
  @ApiBearerAuth()
  @ApiBody({
    description:
      'Set roleIds with an empty array to remove all the roles of the user.',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          email: 'email@example.com',
          phone: '13960068008',
          profile: {
            update: {
              firstName: 'Robert',
              middleName: 'William',
              lastName: 'Smith',
            },
          },
        },
      },
    },
  })
  async editMe(
    @Req() request: Request,
    @Body()
    body: Prisma.UserUpdateInput
  ) {
    const user = await this.accountService.me(request);

    if (!user['profile'] && body.profile) {
      await this.prisma.userProfile.create({
        data: {
          userId: user.id,
          firstName: body.profile.update?.firstName as
            | string
            | null
            | undefined,
          middleName: body.profile.update?.middleName as
            | string
            | null
            | undefined,
          lastName: body.profile.update?.lastName as string | null | undefined,
        },
      });
      delete body.profile;
    }

    return await this.prisma.user.update({
      where: {id: user.id},
      data: body,
      select: {
        id: true,
        email: true,
        phone: true,
        profile: true,
      },
    });
  }

  @ApiBearerAuth()
  @Post('change-password')
  @ApiBody({
    description:
      "The 'userId', 'currentPassword' and 'newPassword' are required in request body.",
    examples: {
      a: {
        summary: '1. new password != current password',
        value: {
          userId: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
          currentPassword: 'Abc1234!',
          newPassword: 'Abc12345!',
        },
      },
      b: {
        summary: '2. new password == current password',
        value: {
          userId: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
          currentPassword: 'Abc1234!',
          newPassword: 'Abc1234!',
        },
      },
    },
  })
  async changePassword(
    @Body() body: {userId: string; currentPassword: string; newPassword: string}
  ) {
    // [step 1] Guard statement.
    if (!('currentPassword' in body) || !('newPassword' in body)) {
      throw new BadRequestException(
        "Please carry 'currentPassword' and 'newPassword' in the request body."
      );
    }

    // [step 2] Verify if the new password is same with the current password.
    if (body.currentPassword.trim() === body.newPassword.trim()) {
      throw new BadRequestException(
        'The new password is same with the current password.'
      );
    }

    // [step 3] Verify the current password.
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {id: body.userId},
    });
    const match = await compareHash(body.currentPassword, user.password);
    if (match === false) {
      throw new BadRequestException('The current password is incorrect.');
    }

    // [step 4] Change password.
    return await this.prisma.user.update({
      where: {id: body.userId},
      data: {password: body.newPassword},
      select: {id: true, email: true, phone: true},
    });
  }

  @NoGuard()
  @Post('send-verification-code')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: 'Reset password',
        value: {
          email: 'henry@inceptionpad.com',
          use: VerificationCodeUse.RESET_PASSWORD,
        },
      },
      b: {
        summary: 'Email login',
        value: {
          email: 'henry@inceptionpad.com',
          use: VerificationCodeUse.LOGIN_BY_EMAIL,
        },
      },
      c: {
        summary: 'Phone login',
        value: {
          phone: '13260000789',
          use: VerificationCodeUse.LOGIN_BY_PHONE,
        },
      },
    },
  })
  async sendVerificationCode(
    @Body() body: {email?: string; phone?: string; use: VerificationCodeUse}
  ): Promise<boolean> {
    if (body.email && verifyEmail(body.email)) {
      return await this.accountService.sendVerificationCode({
        email: body.email,
        use: body.use,
      });
    } else if (body.phone && verifyPhone(body.phone)) {
      return await this.accountService.sendVerificationCode({
        phone: body.phone,
        use: body.use,
      });
    } else {
      return false;
    }
  }

  @NoGuard()
  @Post('reset-password')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: 'Reset password with email',
        value: {
          email: 'henry@inceptionpad.com',
          verificationCode: '283749',
          newPassword: 'abc1234!',
        },
      },
      b: {
        summary: 'Reset password with phone',
        value: {
          phone: '13260000789',
          verificationCode: '283749',
          newPassword: 'abc1234!',
        },
      },
    },
  })
  async resetPassword(
    @Body()
    body: {
      email?: string;
      phone?: string;
      verificationCode: string;
      newPassword: string;
    }
  ) {
    if (body.email && verifyEmail(body.email)) {
      if (
        await this.verificationCodeService.validateForEmail(
          body.verificationCode,
          body.email
        )
      ) {
        return await this.prisma.user.update({
          where: {email: body.email.toLowerCase()},
          data: {password: body.newPassword},
          select: {id: true, email: true, phone: true},
        });
      }
    } else if (body.phone && verifyPhone(body.phone)) {
      if (
        await this.verificationCodeService.validateForPhone(
          body.verificationCode,
          body.phone
        )
      ) {
        return await this.prisma.user.update({
          where: {phone: body.phone},
          data: {password: body.newPassword},
          select: {id: true, email: true, phone: true},
        });
      }
    }

    throw new BadRequestException(
      'The email or verification code is incorrect.'
    );
  }

  /* End */
}
