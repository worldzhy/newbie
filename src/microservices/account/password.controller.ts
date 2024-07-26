import {Controller, Body, BadRequestException, Post} from '@nestjs/common';
import {ApiTags, ApiBody, ApiBearerAuth} from '@nestjs/swagger';
import {VerificationCodeService} from '@microservices/account/verification-code/verification-code.service';
import {NoGuard} from '@microservices/account/security/passport/public/public.decorator';
import {verifyEmail, verifyPhone} from '@toolkit/validators/user.validator';
import {compareHash} from '@toolkit/utilities/common.util';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {
  NewbieException,
  NewbieExceptionType,
} from '@framework/exception/newbie.exception';

@ApiTags('Account')
@Controller('account')
export class PasswordController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly verificationCodeService: VerificationCodeService
  ) {}

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
          currentPassword: '',
          newPassword: 'Abc12345!',
        },
      },
      b: {
        summary: '2. new password == current password',
        value: {
          userId: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
          currentPassword: '',
          newPassword: '',
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
      } else {
        throw new NewbieException(
          NewbieExceptionType.ResetPassword_InvalidCode
        );
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
      } else {
        throw new NewbieException(
          NewbieExceptionType.ResetPassword_InvalidCode
        );
      }
    }

    throw new NewbieException(NewbieExceptionType.ResetPassword_WrongInput);
  }

  /* End */
}
