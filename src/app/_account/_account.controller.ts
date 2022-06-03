/* eslint-disable @typescript-eslint/no-explicit-any */
import {Controller, Body, Post, Request} from '@nestjs/common';
import {ApiTags, ApiBody, ApiBearerAuth} from '@nestjs/swagger';
import {Public} from '../_auth/_auth-jwt/_auth-jwt.decorator';
import {LoggingInByPassword} from '../_auth/_auth-password/_auth-password.decorator';
import {LoggingInByVerificationCode} from '../_auth/_auth-verification-code/_auth-verification-code.decorator';
import {AccountService} from './_account.service';
import {UserService} from '../_user/_user.service';
import {ValidatorAccountService} from '../../_validator/_validator-account.service';

@ApiTags('Account')
@Controller()
export class AccountController {
  private userService = new UserService();

  constructor(private accountService: AccountService) {}

  /**
   * Sign up by:
   * [1] username: password is required
   * [2] email: password is optional
   * [3] phone: password is optional
   *
   * [Constraint] 'password' is required if neither email nor phone is provided.
   *
   * @param {{
   *       username?: string;
   *       password?: string;
   *       email?: string;
   *       phone?: string;
   *     }} signupUser
   * @returns {(Promise<{data: object | null; err: object | null}>)}
   * @memberof AccountController
   */
  @Post('account/signup')
  @Public()
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
        summary: '4. Sign up with username',
        value: {
          username: 'henry',
          password: 'Abc1234!',
          email: 'email@example.com',
          phone: '13960068008',
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
    }
  ): Promise<{data: object | null; err: object | null}> {
    let usernameCount = 0;
    let emailCount = 0;
    let phoneCount = 0;

    // [step 1] Validate parameters.
    if (signupUser.password) {
      if (!ValidatorAccountService.verifyPassword(signupUser.password)) {
        return {
          data: null,
          err: {message: 'Your password is not strong enough.'},
        };
      } else {
        // Go on validating...
        usernameCount += 1;
      }
    }

    if (signupUser.username) {
      if (!ValidatorAccountService.verifyUsername(signupUser.username)) {
        return {
          data: null,
          err: {message: 'Your username is not valid.'},
        };
      } else {
        // Go on validating...
        usernameCount += 1;
      }
    }

    if (signupUser.email) {
      if (!ValidatorAccountService.verifyEmail(signupUser.email)) {
        return {
          data: null,
          err: {message: 'Your email is not valid.'},
        };
      } else {
        // Go on validating...
        emailCount += 1;
      }
    }

    if (signupUser.phone) {
      if (!ValidatorAccountService.verifyPhone(signupUser.phone)) {
        return {
          data: null,
          err: {message: 'Your username is not valid.'},
        };
      } else {
        // End of validating.
        phoneCount += 1;
      }
    }

    // [step 2] Check account existence.
    const existed = await this.userService.checkAccount({
      username: signupUser.username,
      email: signupUser.email,
      phone: signupUser.phone,
    });
    if (existed) {
      return {
        data: null,
        err: {message: 'Your username exists.'},
      };
    }

    // [step 3] Sign up a new account.
    if (usernameCount === 2 || emailCount === 1 || phoneCount === 1) {
      const user = await this.accountService.signup(signupUser);
      if (user) {
        return {
          data: user,
          err: null,
        };
      } else {
        // [Tip] This should not happen.
        return {
          data: null,
          err: {message: 'Create user failed.'},
        };
      }
    } else {
      return {
        data: null,
        err: {message: 'Your parameters are invalid.'},
      };
    }
  }

  /**
   * The 'account' parameter accepts:
   * [1] account
   * [2] email
   * [3] phone
   *
   * @param {{
   *       account: string;
   *       password: string;
   *     }} loginUser
   * @returns {(Promise<{data: object | null; err: object | null}>)}
   * @memberof AccountController
   */
  @Post('account/login-by-password')
  @LoggingInByPassword()
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
    loginUser: {
      account: string;
      password: string;
    }
  ): Promise<{data: object | null; err: object | null}> {
    return await this.accountService.login(loginUser.account);
  }

  /**
   * The 'account' parameter accepts:
   * [1] username
   * [2] email
   * [3] phone
   *
   * @param {{
   *       account: string;
   *       verificationCode: string;
   *     }} loginUser
   * @returns {(Promise<{data: object | null; err: object | null}>)}
   * @memberof AccountController
   */
  @Post('account/login-by-verification-code')
  @LoggingInByVerificationCode()
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
      c: {
        summary: '3. Log in with username',
        value: {
          account: 'henry',
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
  ): Promise<{data: object | null; err: object | null}> {
    const login = await this.accountService.login(body.account);
    return {
      data: login,
      err: null,
    };
  }

  /**
   * Log out
   *
   * @param {*} request
   * @param {{userId: string}} body
   * @returns {(Promise<{data: object | null; err: object | null}>)}
   * @memberof AccountController
   */
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
  @Post('account/logout')
  async logout(
    @Request() request: any,
    @Body() body: {userId: string}
  ): Promise<{data: object | null; err: object | null}> {
    const accessToken = request.headers['authorization'].split(' ')[1];

    await this.accountService.logout(body.userId, accessToken);

    // Always return success no matter if the user exists.
    return {
      data: {message: 'User logs out successfully'},
      err: null,
    };
  }

  /**
   * Close account
   * 1. Call account/apply-verification-code first.
   * 2. Use verification code and userId to close account.
   *
   * @param {{account: string; verificationCode: string}} body
   * @returns {(Promise<{data: object | null; err: object | null}>)}
   * @memberof AccountController
   */
  @Post('account/close')
  @LoggingInByVerificationCode()
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
  ): Promise<{data: object | null; err: object | null}> {
    await this.accountService.close(body.account);

    // Always return success no matter if the user exists.
    return {
      data: {
        message:
          'The account is closed. Please apply to recover it if you want to login again.',
      },
      err: null,
    };
  }

  /**
   * Recover account:
   * 1. Call account/apply-verification-code first.
   * 2. Use verification code and userId to recover account.
   *
   * @param {{account: string; verificationCode: string}} body
   * @returns {(Promise<{data: object | null; err: object | null}>)}
   * @memberof AccountController
   */
  @Post('account/recover')
  @LoggingInByVerificationCode()
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
  ): Promise<{data: object | null; err: object | null}> {
    await this.accountService.recover(body.account);

    // Always return success no matter if the user exists.
    return {
      data: {
        message: 'The account is recovered.',
      },
      err: null,
    };
  }
  /* End */
}
