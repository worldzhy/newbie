import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Request,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody, ApiParam} from '@nestjs/swagger';
import {
  Prisma,
  User,
  UserToken,
  UserTokenStatus,
  UserStatus,
  VerificationCodeUse,
} from '@prisma/client';
import {UserService} from './user/user.service';
import {UserTokenService} from './user/token/token.service';
import {UserProfileService} from './user/profile/profile.service';
import {VerificationCodeService} from '../../microservices/verification-code/verification-code.service';
import {EmailNotificationService} from '../../microservices/notification/email/email.service';
import {SmsNotificationService} from '../../microservices/notification/sms/sms.service';
import * as validator from '../../toolkits/validators/user.validator';
import {TokenService} from '../../toolkits/token/token.service';
import {Public} from './authentication/public/public.decorator';
import {LoggingInByPassword} from './authentication/password/password.decorator';
import {LoggingInByProfile} from './authentication/profile/profile.decorator';
import {LoggingInByUuid} from './authentication/uuid/uuid.decorator';
import {LoggingInByVerificationCode} from './authentication/verification-code/verification-code.decorator';

@ApiTags('[Application] Account')
@Controller('account')
export class AccountController {
  private userService = new UserService();
  private tokenService = new TokenService();
  private userTokenService = new UserTokenService();
  private profileService = new UserProfileService();
  private verificationCodeService = new VerificationCodeService();
  private emailNotificationService = new EmailNotificationService();
  private smsNotificationService = new SmsNotificationService();

  @Public()
  @Post('check')
  @ApiBody({
    description:
      "The request body should contain at least one of the three attributes ['username', 'email', 'phone']. If 'username' is contained, then 'password' is required, or 'password' is optional.",
    examples: {
      a: {
        summary: '1. Check username',
        value: {
          username: 'henry',
        },
      },
      b: {
        summary: '2. Check email',
        value: {
          email: 'email@example.com',
        },
      },
      c: {
        summary: '3. Check phone',
        value: {
          phone: '13960068008',
        },
      },
      d: {
        summary: '4. Check profile',
        value: {
          profile: {
            givenName: 'Robert',
            middleName: 'William',
            familyName: 'Smith',
            suffix: 'PhD',
            birthday: '2019-05-27T11:53:32.118Z',
          },
        },
      },
    },
  })
  async check(
    @Body()
    body: {
      username?: string;
      email?: string;
      phone?: string;
      profile?: object;
    }
  ): Promise<{count: number; message: string}> {
    // [step 1] Check account existence with username, email and phone.
    const users = await this.userService.findMany({
      where: {
        OR: [
          {username: body.username},
          {email: body.email},
          {phone: body.phone},
        ],
      },
    });
    if (users.length > 0) {
      return {
        count: 1,
        message: 'Your account exists.',
      };
    }

    // [step 2] Check account existence with profile.
    if (body.profile) {
      const profiles = await this.profileService.findMany({
        where: {...body.profile},
      });
      if (profiles.length === 1) {
        return {
          count: 1,
          message: 'Your account exists.',
        };
      } else if (profiles.length > 1) {
        return {
          count: 2,
          message: 'Multiple accounts exist.',
        };
      }
    }

    return {
      count: 0,
      message: 'Your account does not exist.',
    };
  }

  /**
   * Sign up by:
   * [1] username: password is required
   * [2] email: password is optional
   * [3] phone: password is optional
   *
   * [Constraint] 'password' is required if neither email nor phone is provided.
   */
  @Public()
  @Post('signup')
  @ApiBody({
    description:
      "The request body should contain at least one of the three attributes ['username', 'email', 'phone']. If 'username' is contained, then 'password' is required, or 'password' is optional.",
    examples: {
      a: {
        summary: '1. Sign up with username',
        value: {
          username: 'henry',
          password: 'Abc1234!',
        },
      },
      b: {
        summary: '2. Sign up with email',
        value: {
          email: 'email@example.com',
        },
      },
      c: {
        summary: '3. Sign up with phone',
        value: {
          phone: '13960068008',
        },
      },
      d: {
        summary: '4. Sign up with profile',
        value: {
          profile: {
            givenName: 'Robert',
            middleName: 'William',
            familyName: 'Smith',
            suffix: 'PhD',
            birthday: '2019-05-27T11:53:32.118Z',
          },
        },
      },
    },
  })
  async signup(
    @Body()
    body: Prisma.UserCreateInput
  ): Promise<User> {
    let usernameCount = 0;
    let emailCount = 0;
    let phoneCount = 0;
    let profileCount = 0;

    // [step 1] Validate parameters.
    if (body.password) {
      if (!validator.verifyPassword(body.password)) {
        throw new BadRequestException('Your password is not strong enough.');
      } else {
        // Go on validating...
        usernameCount += 1;
      }
    }

    if (body.username) {
      if (!validator.verifyUsername(body.username)) {
        throw new BadRequestException('Your username is not valid.');
      } else {
        // Go on validating...
        usernameCount += 1;
      }
    }

    if (body.email) {
      if (!validator.verifyEmail(body.email)) {
        throw new BadRequestException('Your email is not valid.');
      } else {
        // Go on validating...
        emailCount += 1;
      }
    }

    if (body.phone) {
      if (!validator.verifyPhone(body.phone)) {
        throw new BadRequestException('Your phone is not valid.');
      } else {
        // End of validating.
        phoneCount += 1;
      }
    }

    if (body.profiles) {
      profileCount += 1;
    }

    // [step 2] Check account existence.
    const users = await this.userService.findMany({
      where: {
        OR: [
          {username: body.username},
          {email: body.email},
          {phone: body.phone},
        ],
      },
    });
    if (users.length > 0) {
      throw new BadRequestException('Your username exists.');
    }

    // [step 3] Create(Sign up) a new account.
    if (
      usernameCount === 2 ||
      emailCount === 1 ||
      phoneCount === 1 ||
      profileCount === 1
    ) {
      // Generate password hash if needed.
      return await this.userService.create({
        data: body,
        select: {
          id: true,
          email: true,
          phone: true,
          username: true,
          status: true,
          profiles: true,
        },
      });
    } else {
      throw new BadRequestException('Your parameters are invalid.');
    }
  }

  /**
   * After a user is verified by auth guard, this 'login' function returns
   * a JWT to declare the user is authenticated.
   *
   * The 'account' parameter supports:
   * [1] account
   * [2] email
   * [3] phone
   */

  @LoggingInByPassword()
  @Post('login/password')
  @ApiBearerAuth()
  @ApiBody({
    description:
      "The request body should contain 'account' and 'password' attributes.",
    examples: {
      a: {
        summary: '1. Log in with username',
        value: {
          account: 'admin',
          password: 'Abc1234!',
        },
      },
      b: {
        summary: '2. Log in with email',
        value: {
          account: 'email@example.com',
          password: 'Abc1234!',
        },
      },
      c: {
        summary: '3. Log in with phone',
        value: {
          account: '13960068008',
          password: 'Abc1234!',
        },
      },
    },
  })
  async loginByPassword(
    @Body()
    body: {
      account: string;
      password: string;
    }
  ): Promise<UserToken> {
    return await this.login(body.account);
  }

  @LoggingInByProfile()
  @Post('login/profile')
  @ApiBearerAuth()
  @ApiBody({
    description:
      "The request body should contain 'giveName', 'middleName', 'familyName' and 'birthday' attributes. The 'suffix' is optional.",
    examples: {
      a: {
        summary: '1. UserProfile with suffix',
        value: {
          givenName: 'Robert',
          middleName: 'William',
          familyName: 'Smith',
          suffix: 'PhD',
          birthday: '2019-05-27T11:53:32.118Z',
        },
      },
      b: {
        summary: '2. UserProfile without suffix',
        value: {
          givenName: 'Mary',
          middleName: 'Rose',
          familyName: 'Johnson',
          birthday: '2019-05-27T11:53:32.118Z',
        },
      },
    },
  })
  async loginByUserProfile(
    @Body()
    body: {
      givenName: string;
      middleName: string;
      familyName: string;
      suffix?: string;
      birthday: Date;
    }
  ): Promise<UserToken> {
    const profileService = new UserProfileService();

    // [step 1] It has been confirmed there is only one profile.
    const {givenName, middleName, familyName, suffix, birthday} = body;
    const profiles = await profileService.findMany({
      where: {givenName, middleName, familyName, suffix, birthday},
    });

    // [step 2] Login with userId.
    return await this.login(profiles[0].userId);
  }

  @LoggingInByUuid()
  @Post('login/uuid')
  @ApiBearerAuth()
  @ApiBody({
    description: 'Verfiy account by uuid.',
    examples: {
      a: {
        summary: '1. Valid uuid',
        value: {
          uuid: 'e51b4030-39ab-4420-bc87-2907acae824c',
        },
      },
    },
  })
  async loginByUuid(
    @Body()
    body: {
      uuid: string;
    }
  ): Promise<UserToken> {
    return await this.login(body.uuid);
  }

  /**
   * The 'account' parameter supports:
   * [1] email
   * [2] phone
   */
  @LoggingInByVerificationCode()
  @Post('login/verification-code')
  @ApiBearerAuth()
  @ApiBody({
    description:
      "The request body must contain 'account' and 'verificationCode' attributes. The 'username' accepts username, email or phone.",
    examples: {
      a: {
        summary: '1. Log in with email',
        value: {
          account: 'email@example.com',
          verificationCode: '123456',
        },
      },
      b: {
        summary: '2. Log in with phone',
        value: {
          account: '13960068008',
          verificationCode: '123456',
        },
      },
    },
  })
  async loginByVerificationCode(
    @Body()
    body: {
      account: string;
      verificationCode: string;
    }
  ): Promise<UserToken> {
    return await this.login(body.account);
  }

  @Get('current-user')
  @ApiBearerAuth()
  async getCurrentUser(@Request() request: Request): Promise<User> {
    // [step 1] Parse token from http request header.
    const accessToken = this.tokenService.getTokenFromHttpRequest(request);

    // [step 2] Get UserToken record.
    const userToken = await this.userTokenService.findFirstOrThrow({
      where: {AND: [{token: accessToken}, {status: UserTokenStatus.ACTIVE}]},
    });

    // [step 3] Get user.
    return await this.userService.findUniqueOrThrowWithRoles({
      where: {id: userToken.userId},
    });
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiBody({
    description: "The request body must contain 'userId' attribute.",
    examples: {
      a: {
        summary: '1. Log out',
        value: {
          userId: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
        },
      },
    },
  })
  async logout(
    @Request() request: Request,
    @Body() body: {userId: string}
  ): Promise<{data: {message: string}}> {
    const accessToken = this.tokenService.getTokenFromHttpRequest(request);

    await this.userTokenService.updateMany({
      where: {AND: [{userId: body.userId}, {token: accessToken}]},
      data: {status: UserTokenStatus.INACTIVE},
    });

    // Always return success no matter if the user exists.
    return {
      data: {message: 'User logs out successfully'},
    };
  }

  /**
   * Close account
   * 1. Call account/apply-verification-code first.
   * 2. Use verification code and userId to close account.
   */
  @LoggingInByVerificationCode()
  @Patch('close')
  @ApiBearerAuth()
  @ApiBody({
    description: "The request body must contain 'userId' attribute.",
    examples: {
      a: {
        summary: '1. Close with email',
        value: {
          account: 'email@example.com',
          verificationCode: '123456',
        },
      },
      b: {
        summary: '2. Close with phone',
        value: {
          account: '13960068008',
          verificationCode: '123456',
        },
      },
    },
  })
  async close(
    @Body() body: {account: string; verificationCode: string}
  ): Promise<User> {
    // [step 1] Get user.
    const user = await this.userService.findByAccount(body.account);
    if (!user) {
      throw new NotFoundException('The account does not exist.');
    }

    // [step 2] Inactivate user.
    return await this.userService.update({
      where: {id: user.id},
      data: {status: UserStatus.INACTIVE},
    });
  }

  /**
   * Recover account:
   * 1. Call account/apply-verification-code first.
   * 2. Use verification code and userId to recover account.
   */
  @LoggingInByVerificationCode()
  @Patch('recover')
  @ApiBearerAuth()
  @ApiBody({
    description: "The request body must contain 'userId' attribute.",
    examples: {
      a: {
        summary: '1. Recover with email',
        value: {
          account: 'email@example.com',
          verificationCode: '123456',
        },
      },
      b: {
        summary: '2. Recover with phone',
        value: {
          account: '13960068008',
          verificationCode: '123456',
        },
      },
    },
  })
  async recover(
    @Body() body: {account: string; verificationCode: string}
  ): Promise<User> {
    // [step 1] Get user.
    const user = await this.userService.findByAccount(body.account);
    if (!user) {
      throw new NotFoundException('The account does not exist.');
    }

    // [step 2] Activate user.
    return await this.userService.update({
      where: {id: user.id},
      data: {status: UserStatus.ACTIVE},
    });
  }

  // *
  // * Won't send message if the same email apply again within 1 minute.
  // *
  @Public()
  @Get('verification-code/email/:email')
  @ApiParam({
    name: 'email',
    schema: {type: 'string'},
    example: 'email@example.com',
  })
  async getVerificationCodeByEmail(@Param('email') email: string) {
    // [step 1] Guard statement.
    if (!validator.verifyEmail(email)) {
      throw new BadRequestException('The email is invalid.');
    }

    // [step 2] Check if the account exists.
    const user = await this.userService.findByAccount(email);
    if (!user) {
      throw new NotFoundException('Your account is not registered.');
    }

    // [step 3] Generate verification code.
    const verificationCode =
      await this.verificationCodeService.generateForEmail(
        email,
        VerificationCodeUse.LOGIN_BY_EMAIL
      );

    // [step 4] Send verification code.
    await this.emailNotificationService.sendEmail({
      email: email,
      subject: 'Your Verification Code',
      plainText: verificationCode.code,
      html: verificationCode.code,
    });
  }

  // *
  // * Won't send message if the same phone apply again within 1 minute.
  // *
  @Public()
  @Get('verification-code/phone/:phone')
  @ApiParam({
    name: 'phone',
    schema: {type: 'string'},
    example: '13260000999',
  })
  async getVerificationCodeByPhone(@Param('phone') phone: string) {
    // [step 1] Guard statement.
    if (!validator.verifyPhone(phone)) {
      throw new BadRequestException('The phone is invalid.');
    }

    // [step 2] Check if the account exists.
    const user = await this.userService.findByAccount(phone);
    if (!user) {
      throw new NotFoundException('Your account is not registered.');
    }

    // [step 3] Generate verification code.
    const verificationCode =
      await this.verificationCodeService.generateForPhone(
        phone,
        VerificationCodeUse.LOGIN_BY_PHONE
      );

    // [step 4] Send verification code.
    await this.smsNotificationService.sendTextMessage({
      phone: phone,
      text: verificationCode.code,
    });
  }

  private async login(account: string) {
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
  /* End */
}
