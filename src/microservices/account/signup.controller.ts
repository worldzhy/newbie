import {Controller, Post, Body, BadRequestException} from '@nestjs/common';
import {ApiTags, ApiBody} from '@nestjs/swagger';
import {Prisma, User} from '@prisma/client';
import {NoGuard} from '@microservices/account/security/passport/public/public.decorator';
import {
  verifyEmail,
  verifyPassword,
  verifyPhone,
} from '@toolkit/validators/user.validator';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@ApiTags('Account')
@Controller('account')
export class SignupController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Sign up by:
   * [1] email: password is optional
   * [2] phone: password is optional
   *
   * [Constraint] 'password' is required if neither email nor phone is provided.
   */
  @NoGuard()
  @Post('signup')
  @ApiBody({
    description:
      "The request body should contain at least one of the three attributes ['email', 'phone'].",
    examples: {
      a: {
        summary: '1. Sign up with email',
        value: {
          email: 'email@example.com',
          password: '',
        },
      },
      b: {
        summary: '2. Sign up with phone',
        value: {
          phone: '13960068008',
        },
      },
      c: {
        summary: '3. Sign up with profile',
        value: {
          profile: {
            prefix: 'Mr',
            firstName: 'Robert',
            middleName: 'William',
            lastName: 'Smith',
            suffix: 'PhD',
            dateOfBirth: '2019-05-27',
          },
        },
      },
    },
  })
  async signup(@Body() body: Prisma.UserCreateInput) {
    let emailCount = 0;
    let phoneCount = 0;
    let profileCount = 0;

    // [step 1] Validate parameters.
    if (body.password) {
      if (!verifyPassword(body.password)) {
        throw new BadRequestException(
          'Your password is not strong enough. (length >= 8, lowercase >= 1, uppercase >= 1, numbers >= 1, symbols >= 1)'
        );
      }
    }

    if (body.email) {
      if (!verifyEmail(body.email)) {
        throw new BadRequestException('Your email is not valid.');
      } else {
        // Go on validating...
        emailCount += 1;
      }
    }

    if (body.phone) {
      if (!verifyPhone(body.phone)) {
        throw new BadRequestException('Your phone is not valid.');
      } else {
        // End of validating.
        phoneCount += 1;
      }
    }

    if (body.profile) {
      profileCount += 1;
    }

    // [step 2] Check account existence.
    const users = await this.prisma.user.findMany({
      where: {
        OR: [{email: body.email}, {phone: body.phone}],
      },
    });
    if (users.length > 0) {
      throw new BadRequestException('User already exists.');
    }

    // [step 3] Create(Sign up) a new account.
    if (emailCount === 1 || phoneCount === 1 || profileCount === 1) {
      // Generate password hash if needed.
      return await this.prisma.user.create({
        data: body,
        select: {
          id: true,
          email: true,
          phone: true,
          status: true,
          profile: true,
        },
      });
    } else {
      throw new BadRequestException('Your parameters are invalid.');
    }
  }

  /* End */
}
