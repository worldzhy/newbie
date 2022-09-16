import {
  Controller,
  Request,
  Body,
  Post,
  NotFoundException,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {User, UserStatus, VerificationCodeUse} from '@prisma/client';
import {UserService} from './user/user.service';
import {UserJwtService} from './user/jwt/jwt.service';
import {UserProfileService} from './user/profile/profile.service';
import {VerificationCodeService} from './verification-code/verification-code.service';
import * as validator from '../../toolkits/validators/account.validator';
import {Public} from './auth/public/public.decorator';
import {LoggingInByPassword} from './auth/password/password.decorator';
import {LoggingInByProfile} from './auth/profile/profile.decorator';
import {LoggingInByUuid} from './auth/uuid/uuid.decorator';
import {LoggingInByVerificationCode} from './auth/verification-code/verification-code.decorator';
import {generateHash} from '../../toolkits/utilities/common.util';

@ApiTags('[Application] Account')
@ApiBearerAuth()
@Controller('account')
export class AccountController {
  private userService = new UserService();
  private userJwtService = new UserJwtService();
  private profileService = new UserProfileService();
  private verificationCodeService = new VerificationCodeService();

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
    const existed = await this.userService.checkAccount({
      username: body.username,
      email: body.email,
      phone: body.phone,
    });
    if (existed) {
      return {
        count: 1,
        message: 'Your account exists.',
      };
    }

    // [step 2] Check account existence with profile.
    if (body.profile) {
      const profiles = await this.profileService.findMany({...body.profile});
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

  // *
  // * Won't send message if the same email apply again within 1 minute.
  // *
  @Public()
  @Post('verification-code/email/generate')
  @ApiBody({
    description:
      "Valid 'use' can be 'login-by-email', 'close-account-by-email', 'recover-account-by-email'...",
    examples: {
      a: {
        summary: '1. Login by email',
        value: {
          email: 'email@example.com',
          use: VerificationCodeUse.LOGIN_BY_EMAIL,
        },
      },
      b: {
        summary: '2. Close account by email',
        value: {
          email: 'email@example.com',
          use: VerificationCodeUse.CLOSE_ACCOUNT_BY_EMAIL,
        },
      },
    },
  })
  async send2Email(@Body() body: {email: string; use: VerificationCodeUse}) {
    const {email, use} = body;

    // [step 1] Guard statement.
    if (!validator.verifyEmail(email)) {
      return {err: {message: 'The email is invalid.'}};
    }

    if (
      use !== VerificationCodeUse.LOGIN_BY_EMAIL &&
      use !== VerificationCodeUse.CLOSE_ACCOUNT_BY_EMAIL &&
      use !== VerificationCodeUse.RECOVER_ACCOUNT_BY_EMAIL
    ) {
      return {err: {message: "The 'use' is invalid."}};
    }

    // [step 2] Check if the account exists.
    const user = await this.userService.findByAccount(email);
    if (!user) {
      return {
        err: {message: 'Your account is not registered.'},
      };
    }

    // [step 3] Generate and send verification code.
    return await this.verificationCodeService.send2Email(email, use);
  }

  @Public()
  @Post('verification-code/email/validate')
  @ApiBody({
    description:
      "The request body must contain one of ['userId', 'email', 'phone'] and 'code'.",
    examples: {
      a: {
        summary: '1. Validate with email',
        value: {
          email: 'email@example.com',
          code: '123456',
        },
      },
    },
  })
  async validateWithEmail(
    @Body() body: {code: string; email: string}
  ): Promise<boolean> {
    // [step 1] Guard statement.
    const {code, email} = body;
    if (!code || !validator.verifyEmail(email)) {
      return false;
    }

    // [step 2] Check if the account exists.
    const user = await this.userService.findByAccount(email);
    if (!user) {
      return false;
    }

    // [step 3] Validate code.
    return await this.verificationCodeService.validateWithEmail(code, email);
  }

  // *
  // * Won't send message if the same phone apply again within 1 minute.
  // *
  @Public()
  @Post('verification-code/text-message/generate')
  @ApiBody({
    description:
      "Valid 'use' can be 'login-by-phone', 'close-account-by-phone', 'recover-account-by-phone'...",
    examples: {
      a: {
        summary: '3. Recover account by phone',
        value: {
          phone: '13960068008',
          use: VerificationCodeUse.RECOVER_ACCOUNT_BY_PHONE,
        },
      },
    },
  })
  async send2TextMessage(
    @Body() body: {phone: string; use: VerificationCodeUse}
  ) {
    const {phone, use} = body;

    // [step 1] Guard statement.
    if (!validator.verifyPhone(phone)) {
      return {err: {message: 'The phone is invalid.'}};
    }

    if (
      use !== VerificationCodeUse.LOGIN_BY_PHONE &&
      use !== VerificationCodeUse.CLOSE_ACCOUNT_BY_PHONE &&
      use !== VerificationCodeUse.RECOVER_ACCOUNT_BY_PHONE
    ) {
      return {err: {message: "The 'use' is invalid."}};
    }

    // [step 2] Check if the account exists.
    const user = await this.userService.findByAccount(phone);
    if (!user) {
      return {
        err: {message: 'Your account is not registered.'},
      };
    }

    // [step 3] Generate verification code.
    return await this.verificationCodeService.send2Phone(phone, use);
  }

  @Public()
  @Post('verification-code/text-message/validate')
  @ApiBody({
    description:
      "The request body must contain one of ['userId', 'email', 'phone'] and 'code'.",
    examples: {
      a: {
        summary: '2. Validate with phone',
        value: {
          phone: '13960068008',
          code: '123456',
        },
      },
    },
  })
  async validateWithPhone(
    @Body() body: {code: string; phone: string}
  ): Promise<boolean> {
    // [step 1] Validate phone.
    const {code, phone} = body;
    if (!code || !validator.verifyPhone(phone)) {
      return false;
    }

    // [step 2] Check if the account exists.
    const user = await this.userService.findByAccount(phone);
    if (!user) {
      return false;
    }

    // [step 3] Validate code.
    return await this.verificationCodeService.validateWithPhone(code, phone);
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
    signupUser: {
      username?: string;
      password?: string;
      email?: string;
      phone?: string;
      profile?: object;
    }
  ): Promise<User | {err: {message: string}}> {
    let usernameCount = 0;
    let emailCount = 0;
    let phoneCount = 0;
    let profileCount = 0;

    // [step 1] Validate parameters.
    if (signupUser.password) {
      if (!validator.verifyPassword(signupUser.password)) {
        return {err: {message: 'Your password is not strong enough.'}};
      } else {
        // Go on validating...
        usernameCount += 1;
      }
    }

    if (signupUser.username) {
      if (!validator.verifyUsername(signupUser.username)) {
        return {err: {message: 'Your username is not valid.'}};
      } else {
        // Go on validating...
        usernameCount += 1;
      }
    }

    if (signupUser.email) {
      if (!validator.verifyEmail(signupUser.email)) {
        return {err: {message: 'Your email is not valid.'}};
      } else {
        // Go on validating...
        emailCount += 1;
      }
    }

    if (signupUser.phone) {
      if (!validator.verifyPhone(signupUser.phone)) {
        return {err: {message: 'Your phone is not valid.'}};
      } else {
        // End of validating.
        phoneCount += 1;
      }
    }

    if (signupUser.profile) {
      profileCount += 1;
    }

    // [step 2] Check account existence.
    const existed = await this.userService.checkAccount({
      username: signupUser.username,
      email: signupUser.email,
      phone: signupUser.phone,
    });
    if (existed) {
      return {err: {message: 'Your username exists.'}};
    }

    // [step 3] Create(Sign up) a new account.
    if (
      usernameCount === 2 ||
      emailCount === 1 ||
      phoneCount === 1 ||
      profileCount === 1
    ) {
      // Generate password hash if needed.
      let passwordHash: string | null | undefined;
      if (signupUser.password) {
        passwordHash = await generateHash(signupUser.password);
      }

      return this.userService.create({
        data: signupUser,
        select: {
          id: true,
          username: true,
          email: true,
          phone: true,
          status: true,
          profiles: true,
        },
      });
    } else {
      return {err: {message: 'Your parameters are invalid.'}};
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
  @ApiBody({
    description:
      "The request body should contain 'account' and 'password' attributes.",
    examples: {
      a: {
        summary: '1. Log in with username',
        value: {
          account: 'henry',
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
  ): Promise<{userId: string; token: string} | {err: {message: string}}> {
    return await this.login(body.account);
  }

  @LoggingInByProfile()
  @Post('login/profile')
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
  ): Promise<{userId: string; token: string} | {err: {message: string}}> {
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
  ): Promise<{userId: string; token: string} | {err: {message: string}}> {
    return await this.login(body.uuid);
  }

  /**
   * The 'account' parameter supports:
   * [1] email
   * [2] phone
   */
  @LoggingInByVerificationCode()
  @Post('login/verification-code')
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
  ): Promise<{userId: string; token: string} | {err: {message: string}}> {
    return await this.login(body.account);
  }

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
  @Post('logout')
  async logout(
    @Request() request: any,
    @Body() body: {userId: string}
  ): Promise<{data: {message: string}}> {
    const accessToken = request.headers['authorization'].split(' ')[1];
    await this.userJwtService.inactivateJWT(body.userId, accessToken);

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
  @Post('close')
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
  @Post('recover')
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

  private async login(account: string) {
    // [step 1] Get user.
    const user = await this.userService.findByAccount(account);
    if (!user) {
      return {
        err: {
          message: 'Your account does not exist.',
        },
      };
    }

    // [step 2] Check if the account is active.
    if (user.status === UserStatus.INACTIVE) {
      return {
        err: {
          message: 'You have closed your account, do you want to recover it?',
        },
      };
    }

    // [step 3] Disable active JSON web token if existed.
    await this.userJwtService.inactivateJWTs(user.id);

    // [step 4] Generate a new JSON web token.
    const jwt = await this.userJwtService.createJWT({
      userId: user.id,
      sub: account,
    });
    if (!jwt) {
      return {
        err: {
          message: 'Your login process has failed. Please try again later.',
        },
      };
    }

    // [step 5] Update last login time.
    await this.userService.update({
      where: {id: user.id},
      data: {lastLoginAt: new Date()},
    });

    return {userId: user.id, token: jwt.token};
  }
  /* End */
}
