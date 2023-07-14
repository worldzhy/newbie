import {Controller, Post, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {UserToken} from '@prisma/client';
import {UserProfileService} from './user/profile/profile.service';
import {LoggingInByPassword} from './authentication/password/password.decorator';
import {LoggingInByProfile} from './authentication/profile/profile.decorator';
import {LoggingInByUuid} from './authentication/uuid/uuid.decorator';
import {LoggingInByVerificationCode} from './authentication/verification-code/verification-code.decorator';
import {AccountService} from './account.service';

@ApiTags('[Application] Account')
@Controller('account')
export class AccountLoginController {
  private accountService = new AccountService();

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
  @Post('login-by-password')
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
    return await this.accountService.login(body.account);
  }

  @LoggingInByProfile()
  @Post('login-by-profile')
  @ApiBearerAuth()
  @ApiBody({
    description:
      "The request body should contain 'firstName', 'middleName', 'lastName' and 'dateOfBirth' attributes. The 'suffix' is optional.",
    examples: {
      a: {
        summary: '1. UserProfile with suffix',
        value: {
          firstName: 'Robert',
          middleName: 'William',
          lastName: 'Smith',
          suffix: 'PhD',
          dateOfBirth: '2019-05-27',
        },
      },
      b: {
        summary: '2. UserProfile without suffix',
        value: {
          firstName: 'Mary',
          middleName: 'Rose',
          lastName: 'Johnson',
          dateOfBirth: '2019-05-27',
        },
      },
    },
  })
  async loginByUserProfile(
    @Body()
    body: {
      firstName: string;
      middleName: string;
      lastName: string;
      suffix?: string;
      dateOfBirth: Date;
    }
  ): Promise<UserToken> {
    const profileService = new UserProfileService();

    // [step 1] It has been confirmed there is only one profile.
    const {firstName, middleName, lastName, suffix, dateOfBirth} = body;
    const profiles = await profileService.findMany({
      where: {firstName, middleName, lastName, suffix, dateOfBirth},
    });

    // [step 2] Login with userId.
    return await this.accountService.login(profiles[0].userId);
  }

  @LoggingInByUuid()
  @Post('login-by-uuid')
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
    return await this.accountService.login(body.uuid);
  }

  /**
   * The 'account' parameter supports:
   * [1] email
   * [2] phone
   */
  @LoggingInByVerificationCode()
  @Post('login-by-verification-code')
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
    return await this.accountService.login(body.account);
  }

  /* End */
}
