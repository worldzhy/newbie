import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import {PermissionAction, Prisma, User, UserToRole} from '@prisma/client';
import {UserService} from './user.service';
import * as validator from '../../../../toolkits/validators/account.validator';
import {RequirePermission} from '../../authorization/authorization.decorator';
const bcrypt = require('bcryptjs');

@ApiTags('[Application] Account / Organization / User')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  private userService = new UserService();

  @Get('count')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.User)
  @ApiQuery({name: 'name', type: 'string'})
  async countUsers(@Query() query: {name?: string}): Promise<number> {
    // [step 1] Construct where argument.
    let where: Prisma.UserWhereInput | undefined;
    const conditions: object[] = [];
    if (query.name) {
      const name = query.name.trim();
      if (name.length > 0) {
        conditions.push({username: {search: name}});
        conditions.push({
          profiles: {
            some: {
              OR: [
                {givenName: {search: name}},
                {familyName: {search: name}},
                {middleName: {search: name}},
              ],
            },
          },
        });
      }
    }

    if (conditions.length > 0) {
      where = {OR: conditions};
    }

    // [step 2] Count.
    return await this.userService.count({
      where: where,
    });
  }

  @Post('')
  @RequirePermission(PermissionAction.create, Prisma.ModelName.User)
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          username: 'dispatcher',
          password: 'Abc1234!',
          userToRoles: {
            create: [
              {
                roleId: '013f92b0-4a53-45cb-8eca-e66089a3919f',
              },
            ],
          },
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
  @RequirePermission(PermissionAction.read, Prisma.ModelName.User)
  @ApiQuery({name: 'name', type: 'string'})
  @ApiQuery({name: 'page', type: 'number'})
  @ApiQuery({name: 'pageSize', type: 'number'})
  async getUsers(
    @Query() query: {name?: string; page?: string; pageSize?: string}
  ): Promise<User[]> {
    // [step 1] Construct where argument.
    let where: Prisma.UserWhereInput | undefined;
    const whereConditions: object[] = [];
    if (query.name) {
      const name = query.name.trim();
      if (name.length > 0) {
        whereConditions.push({username: {search: name}});
        whereConditions.push({
          profiles: {
            some: {
              OR: [
                {givenName: {search: name}},
                {familyName: {search: name}},
                {middleName: {search: name}},
              ],
            },
          },
        });
      }
    }

    if (whereConditions.length > 0) {
      where = {OR: whereConditions};
    }

    // [step 2] Construct take and skip arguments.
    let take: number, skip: number;
    if (query.page && query.pageSize) {
      // Actually 'page' is string because it comes from URL param.
      const page = parseInt(query.page);
      const pageSize = parseInt(query.pageSize);
      if (page > 0 && pageSize > 0) {
        take = pageSize;
        skip = pageSize * (page - 1);
      } else {
        throw new BadRequestException(
          'The page and pageSize must be larger than 0.'
        );
      }
    } else {
      take = 10;
      skip = 0;
    }

    // [step 3] Get users.
    return await this.userService.findMany({
      // orderBy: {
      //   _relevance: {
      //     fields: ['username'],
      //     search: 'database',
      //     sort: 'asc',
      //   },
      // },
      where: where,
      take: take,
      skip: skip,
    });
  }

  @Get(':userId')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.User)
  @ApiParam({
    name: 'userId',
    schema: {type: 'string'},
    description: 'The uuid of the user.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  async getUser(@Param('userId') userId: string): Promise<User | null> {
    return await this.userService.findUnique({
      where: {id: userId},
    });
  }

  @Patch(':userId')
  @RequirePermission(PermissionAction.update, Prisma.ModelName.User)
  @ApiParam({
    name: 'userId',
    schema: {type: 'string'},
    description: 'The uuid of the user.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  async updateUser(
    @Param('userId') userId: string,
    @Body()
    body: Prisma.UserUpdateInput
  ): Promise<User> {
    return await this.userService.update({
      where: {id: userId},
      data: body,
    });
  }

  @Delete(':userId')
  @RequirePermission(PermissionAction.delete, Prisma.ModelName.User)
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

  @Get(':userId/profiles')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.User)
  @ApiParam({
    name: 'userId',
    schema: {type: 'string'},
    description: 'The uuid of the user.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  async getUserProfiles(@Param('userId') userId: string): Promise<User> {
    return await this.userService.findUniqueOrThrow({
      where: {id: userId},
      include: {profiles: true},
    });
  }

  @Get(':userId/roles')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.User)
  @ApiParam({
    name: 'userId',
    schema: {type: 'string'},
    description: 'The uuid of the user.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  async getUserRoles(@Param('userId') userId: string): Promise<User> {
    return await this.userService.findUniqueOrThrowWithRoles({
      where: {id: userId},
    });
  }

  @Patch(':userId/change-password')
  @RequirePermission(PermissionAction.update, Prisma.ModelName.User)
  @ApiParam({
    name: 'userId',
    schema: {type: 'string'},
    description: 'The uuid of the user.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  @ApiBody({
    description:
      "The 'userId', 'currentPassword' and 'newPassword' are required in request body.",
    examples: {
      a: {
        summary: '1. new password != current password',
        value: {
          currentPassword: 'Abc1234!',
          newPassword: 'Abc12345!',
        },
      },
      b: {
        summary: '2. new password == current password',
        value: {
          currentPassword: 'Abc1234!',
          newPassword: 'Abc1234!',
        },
      },
    },
  })
  async changePassword(
    @Param('userId') userId: string,
    @Body() body: {currentPassword: string; newPassword: string}
  ): Promise<User> {
    // [step 1] Guard statement.
    if (
      !('userId' in body) ||
      !('currentPassword' in body) ||
      !('newPassword' in body)
    ) {
      throw new BadRequestException(
        "Please carry 'userId', 'currentPassword' and 'newPassword' in the request body."
      );
    }

    // [step 2] Verify if the new password is same with the current password.
    if (body.currentPassword.trim() === body.newPassword.trim()) {
      throw new BadRequestException(
        'The new password is same with the current password.'
      );
    }

    // [step 3] Validate the new password.
    if (!validator.verifyPassword(body.newPassword)) {
      throw new BadRequestException('The new password is invalid.');
    }

    // [step 4] Verify the current password.
    const user = await this.userService.findUnique({where: {id: userId}});
    if (!user) {
      throw new BadRequestException('The user is not existed.');
    }
    const match = await bcrypt.compare(body.currentPassword, user.password);
    if (match === false) {
      throw new BadRequestException('The current password is incorrect.');
    }

    // [step 5] Change password.
    return await this.userService.update({
      where: {id: userId},
      data: {password: body.newPassword},
      select: {id: true, username: true, email: true, phone: true},
    });
  }

  @Patch(':userId/reset-password')
  @RequirePermission(PermissionAction.update, Prisma.ModelName.User)
  @ApiParam({
    name: 'userId',
    schema: {type: 'string'},
    description: 'The uuid of the user.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  @ApiBody({
    description: 'The new password.',
    examples: {
      a: {
        summary: '1. Missing uppercase letter(s)',
        value: {
          newPassword: 'abc1234!',
        },
      },
      b: {
        summary: '2. Correct format',
        value: {
          newPassword: 'Abc1234!',
        },
      },
    },
  })
  async resetPassword(
    @Param('userId') userId: string,
    @Body() body: {newPassword: string}
  ): Promise<User> {
    // [step 1] Guard statement
    if (!('newPassword' in body)) {
      throw new BadRequestException(
        "Please carry 'newPassword' in the request body."
      );
    }

    // [step 2] Validate the new password
    if (!validator.verifyPassword(body.newPassword)) {
      throw new BadRequestException('The new password is invalid.');
    }

    // [step 3] Reset password
    return await this.userService.update({
      where: {id: userId},
      data: {password: body.newPassword},
      select: {id: true, username: true, email: true, phone: true},
    });
  }

  /* End */
}
