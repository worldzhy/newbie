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
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import {
  PermissionAction,
  Prisma,
  User,
  UserStatus,
  UserToRole,
} from '@prisma/client';
import {UserService} from './user.service';
import {RequirePermission} from '../authorization/authorization.decorator';
import {compareHash} from '../../../toolkit/utilities/common.util';
import {verifyUuid} from '../../../toolkit/validators/user.validator';
import {formatPaginationResponse} from '../../../toolkit/format/pagination.format';

@ApiTags('[Application] Account / User')
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
          email: '',
          phone: '',
          username: 'dispatcher',
          password: 'Abc1234!',
          status: UserStatus.ACTIVE,
          roles: [{id: '013f92b0-4a53-45cb-8eca-e66089a3919f'}],
        },
      },
    },
  })
  async createUser(
    @Body()
    body: Prisma.UserCreateInput & {roles?: {id: string; name: string}[]} & {
      sites?: string[];
    }
  ): Promise<User> {
    // Construct userToRoles.
    if (body.roles && body.roles.length > 0) {
      body.userToRoles = {
        create: body.roles.map(role => {
          return {roleId: role.id};
        }),
      };
      // Remove roleIds since it is not a field of User model.
      delete body.roles;
    }

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
  }

  @Get('')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.User)
  @ApiQuery({name: 'name', type: 'string'})
  @ApiQuery({name: 'roleId', type: 'string'})
  @ApiQuery({name: 'page', type: 'number'})
  @ApiQuery({name: 'pageSize', type: 'number'})
  async getUsers(
    @Query()
    query: {
      name?: string;
      roleId?: string;
      page?: string;
      pageSize?: string;
    }
  ) {
    // [step 1] Construct where argument.
    let where: Prisma.UserWhereInput | undefined;
    const whereConditions: object[] = [];
    if (query.name) {
      const name = query.name.trim();
      if (name.length > 0) {
        whereConditions.push({username: {contains: name}});
      }
    }

    if (query.roleId) {
      const roleId = query.roleId.trim();
      if (verifyUuid(roleId)) {
        whereConditions.push({userToRoles: {some: {roleId: roleId}}});
      }
    }

    if (whereConditions.length > 1) {
      where = {OR: whereConditions};
    } else if (whereConditions.length === 1) {
      where = whereConditions[0];
    } else {
      // where === undefined
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
    const [users, total] = await this.userService.findManyWithTotal({
      where: where,
      take: take,
      skip: skip,
      include: {
        userToRoles: {include: {role: true}},
        profiles: true,
        locations: true,
      },
    });

    // [step 4] Return users with roles.
    const records = users.map(user => {
      if (user['userToRoles']) {
        user['roles'] = user['userToRoles'].map((userToRole: UserToRole) => {
          return userToRole['role'];
        });
      }
      delete user['userToRoles'];

      return this.userService.withoutPassword(user);
    });

    return formatPaginationResponse({records, total, query});
  }

  @Get(':userId')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.User)
  @ApiParam({
    name: 'userId',
    schema: {type: 'string'},
    description: 'The uuid of the user.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  async getUser(@Param('userId') userId: string) {
    const user = await this.userService.findUniqueOrThrow({
      where: {id: userId},
      include: {
        userToRoles: {include: {role: true}},
        profiles: true,
        locations: true,
      },
    });

    if (user['userToRoles']) {
      user['roles'] = user['userToRoles'].map((userToRole: UserToRole) => {
        return userToRole['role'];
      });
    }
    delete user['userToRoles'];

    return this.userService.withoutPassword(user);
  }

  @Patch(':userId')
  @RequirePermission(PermissionAction.update, Prisma.ModelName.User)
  @ApiParam({
    name: 'userId',
    schema: {type: 'string'},
    description: 'The uuid of the user.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  @ApiBody({
    description:
      'Set roleIds with an empty array to remove all the roles of the user.',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          email: '',
          phone: '',
          username: 'dispatcher',
          password: 'Abc1234!',
          status: UserStatus.INACTIVE,
          roles: [{id: '013f92b0-4a53-45cb-8eca-e66089a3919f'}],
          sites: ['Harley Davidson Lifestyle Centers'],
        },
      },
    },
  })
  async updateUser(
    @Param('userId') userId: string,
    @Body()
    body: Prisma.UserUpdateInput & {roles?: {id: string; name: string}[]} & {
      sites?: string[];
    }
  ): Promise<User> {
    // Construct userToRoles.
    if (body.roles && Array.isArray(body.roles)) {
      body.userToRoles = {
        deleteMany: {}, // First, delete all existing UserToRole records.
        create: body.roles.map(role => {
          return {roleId: role.id};
        }), // Then, create new UserToRole records.
      };
      // Remove roleIds since it is not a field of User model.
      delete body.roles;
    }

    // Construct locationss.
    if (body.sites) {
      body.locations = {
        deleteMany: {},
        create: body.sites.map(site => {
          return {site: site};
        }),
      };
      // Remove sites since it is not a field of User model.
      delete body.sites;
    }

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
  async getUserProfiles(@Param('userId') userId: string) {
    const user = await this.userService.findUniqueOrThrow({
      where: {id: userId},
      include: {profiles: true},
    });

    return this.userService.withoutPassword(user);
  }

  @Get(':userId/roles')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.User)
  @ApiParam({
    name: 'userId',
    schema: {type: 'string'},
    description: 'The uuid of the user.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  async getUserRoles(@Param('userId') userId: string) {
    const user = await this.userService.findUniqueOrThrowWithRoles({
      where: {id: userId},
    });

    return this.userService.withoutPassword(user);
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
    const user = await this.userService.findUnique({where: {id: userId}});
    if (!user) {
      throw new NotFoundException('Not found the user.');
    }
    const match = await compareHash(body.currentPassword, user.password);
    if (match === false) {
      throw new BadRequestException('The current password is incorrect.');
    }

    // [step 4] Change password.
    return await this.userService.update({
      where: {id: userId},
      data: {password: body.newPassword},
      select: {id: true, username: true, email: true, phone: true},
    });
  }

  /* End */
}
