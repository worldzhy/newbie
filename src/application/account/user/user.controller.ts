import {
  Controller,
  Get,
  Param,
  Body,
  Patch,
  Query,
  Post,
  Delete,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {Prisma, User} from '@prisma/client';
import {UserService} from './user.service';
import {UserJwtService} from './jwt/jwt.service';
import {UserProfileService} from './profile/profile.service';
import * as validator from '../../../toolkits/validators/account.validator';

@ApiTags('[Application] Account / User')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  private userService = new UserService();
  private userJwtService = new UserJwtService();
  private profileService = new UserProfileService();

  @Post('')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          phone: '13260000999',
        },
      },
    },
  })
  async createUser(@Body() body: Prisma.UserCreateInput): Promise<User> {
    return await this.userService.create({
      data: body,
    });
  }

  @Get('')
  @ApiParam({
    required: false,
    name: 'name',
    description: 'The string you want to search in the user pool.',
    example: 'jack',
    schema: {type: 'string'},
  })
  @ApiParam({
    required: false,
    name: 'page',
    schema: {type: 'number'},
    description:
      'The page of the user list. It must be a number and LARGER THAN 0.',
    example: 1,
  })
  async getUsers(
    @Query() query: {name?: string; page?: string}
  ): Promise<User[] | {err: {message: string}}> {
    // [step 1] Construct where argument.
    let where: Prisma.UserWhereInput | undefined;
    if (query.name) {
      const name = query.name.trim();
      if (name.length > 0) {
        where = {
          OR: [
            {username: {search: name}},
            {
              profiles: {
                some: {
                  OR: [
                    {givenName: {search: name}},
                    {familyName: {search: name}},
                    {middleName: {search: name}},
                  ],
                },
              },
            },
          ],
        };
      }
    }

    // [step 2] Construct take and skip arguments.
    let take: number, skip: number;
    if (query.page) {
      // Actually 'page' is string because it comes from URL param.
      const page = parseInt(query.page);
      if (page > 0) {
        take = 10;
        skip = 10 * (page - 1);
      } else {
        return {err: {message: 'The page must be larger than 0.'}};
      }
    } else {
      take = 10;
      skip = 0;
    }

    // [step 3] Get users.
    return await this.userService.findMany({
      select: {
        id: true,
        username: true,
        profiles: true,
        passwordHash: false,
      },
      orderBy: {
        _relevance: {
          fields: ['username'],
          search: 'database',
          sort: 'asc',
        },
      },
      where: where,
      take: take,
      skip: skip,
    });
  }

  @Get(':userId')
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

  @Delete(':userId')
  @ApiParam({
    name: 'userId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  async deleteUser(@Param('userId') userId: string): Promise<User> {
    return await this.userService.delete({
      where: {id: userId},
    });
  }

  @Patch('change-password')
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

  @Patch('reset-password')
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
