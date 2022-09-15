import {Controller, Get, Param, Body, Patch} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {UserService} from './user.service';
import * as validator from '../account.validator';
import {User} from '@prisma/client';

@ApiTags('[Product] Account / User')
@ApiBearerAuth()
@Controller()
export class UserController {
  constructor(private userService: UserService) {}

  /**
   * Get user by id
   *
   * @param {string} userId
   * @returns {Promise<{ data: object, err: object}>}
   * @memberof UserController
   */
  @Get('users/:userId')
  @ApiParam({
    name: 'userId',
    schema: {type: 'string'},
    description: 'The uuid of the user.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  async getUser(@Param('userId') userId: string): Promise<User | null> {
    return await this.userService.findUnique({
      where: {id: userId},
      include: {profiles: true},
    });
  }

  /**
   * Get users by page number. The order is by username.
   *
   * @param {number} page
   * @returns {Promise<{ data: object, err: object }>}
   * @memberof UserController
   */
  @Get('users/page=:page')
  @ApiParam({
    name: 'page',
    schema: {type: 'number'},
    description:
      'The page of the user list. It must be a LARGER THAN 0 integer.',
    example: 1,
  })
  async getUsers(@Param('page') page: number): Promise<User[] | {err: object}> {
    // [step 1] Guard statement.
    let p = page;
    if (typeof page === 'string') {
      // Actually 'page' is string because it comes from URL param.
      p = parseInt(page);
    }
    if (p < 1) {
      return {
        err: {message: "The 'page' must be a large than 0 integer."},
      };
    }

    // [step 2] Get users.
    return await this.userService.findMany({
      orderBy: {
        _relevance: {
          fields: ['username'],
          search: 'database',
          sort: 'asc',
        },
      },
      take: 10,
      skip: 10 * (p - 1),
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        passwordHash: false,
      },
    });
  }

  /**
   * Get users by searching name.
   * @param {string} name
   * @param {number} page
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof UserController
   */
  @Get('users/name=:name&page=:page')
  @ApiParam({
    name: 'name',
    description: 'The string you want to search in the user pool.',
    example: 'jack',
    schema: {type: 'string'},
  })
  @ApiParam({
    name: 'page',
    schema: {type: 'number'},
    description:
      'The page of the user list. It must be a number and LARGER THAN 0.',
    example: 1,
  })
  async getUsersByName(
    @Param('name') name: string,
    @Param('page') page: number
  ): Promise<User[] | {err: object}> {
    // [step 1] Guard statement.
    const s = name.trim();
    let p = page;
    if (typeof page === 'string') {
      // Actually 'page' is string because it comes from URL param.
      p = parseInt(page);
    }
    if (s.length < 1 || p < 1) {
      return {
        err: {
          message:
            "The 'str' length and 'page' must be larger than 0 integers.",
        },
      };
    }

    // [step 2] Search username, given name, family name...
    return await this.userService.findMany({
      where: {
        OR: [
          {username: {search: s}},
          {
            profiles: {
              some: {
                OR: [
                  {givenName: {search: s}},
                  {familyName: {search: s}},
                  {middleName: {search: s}},
                ],
              },
            },
          },
        ],
      },
      orderBy: {
        _relevance: {
          fields: ['username'],
          search: 'database',
          sort: 'asc',
        },
      },
      take: 10,
      skip: 10 * (p - 1),
      select: {
        id: true,
        username: true,
        profiles: true,
        passwordHash: false,
      },
    });
  }

  /**
   * Change password
   *
   * @param {Request} request.body should be {userId, currentPassword, newPassword}
   * @returns {Promise<{data: object | null; err: object | null}>}
   * @memberof AuthController
   */
  @Patch('users/change-password')
  @ApiBearerAuth()
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
  ): Promise<{data: object | null; err: object | null}> {
    // [step 1] Guard statement.
    if (
      !('userId' in body) ||
      !('currentPassword' in body) ||
      !('newPassword' in body)
    ) {
      return {
        data: null,
        err: {
          message:
            "Please carry 'userId', 'currentPassword' and 'newPassword' in the request body.",
        },
      };
    }

    // [step 2] Verify if the new password is same with the current password.
    if (body.currentPassword.trim() === body.newPassword.trim()) {
      return {
        data: null,
        err: {message: 'The new password is same with the current password.'},
      };
    }

    // [step 3] Validate the new password.
    if (!validator.verifyPassword(body.newPassword)) {
      return {
        data: null,
        err: {message: 'The new password is invalid.'},
      };
    }

    // [step 4] Change password.
    const result = await this.userService.changePassword(
      body.userId,
      body.currentPassword,
      body.newPassword
    );
    if (result) {
      return {
        data: {message: 'Change password successfully.'},
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Change password failed.'},
      };
    }
  }

  /**
   * Reset password
   *
   * @param {*} request.body should be {userId, newPassword}
   * @returns {(Promise<{data: object | null; err: object | null}>)}
   * @memberof UserController
   */
  @Patch('users/reset-password')
  @ApiBearerAuth()
  @ApiBody({
    description: 'The new password.',
    examples: {
      a: {
        summary: '1. Missing uppercase letter(s)',
        value: {
          userId: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
          newPassword: 'abc1234!',
        },
      },
      b: {
        summary: '2. Correct format',
        value: {
          userId: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
          newPassword: 'Abc1234!',
        },
      },
    },
  })
  async resetPassword(
    @Body() body: {userId: string; newPassword: string}
  ): Promise<{data: object | null; err: object | null}> {
    // [step 1] Guard statement
    if (!('userId' in body) || !('newPassword' in body)) {
      return {
        data: null,
        err: {
          message:
            "Please carry 'userId' and 'newPassword' in the request body.",
        },
      };
    }

    // [step 2] Validate the new password
    if (!validator.verifyPassword(body.newPassword)) {
      return {
        data: null,
        err: {message: 'The new password is invalid.'},
      };
    }

    // [step 3] Reset password
    if (await this.userService.resetPassword(body.userId, body.newPassword)) {
      return {
        data: {message: 'Reset password successfully.'},
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Reset password failed.'},
      };
    }
  }

  /* End */
}
