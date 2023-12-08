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
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {PermissionAction, Prisma, Role, User, UserStatus} from '@prisma/client';
import {UserService} from '@microservices/account/user/user.service';
import {RequirePermission} from '@microservices/account/security/authorization/authorization.decorator';
import {compareHash} from '@toolkit/utilities/common.util';
import {verifyUuid} from '@toolkit/validators/user.validator';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@ApiTags('Account / User')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService
  ) {}

  @Post('')
  @RequirePermission(PermissionAction.Create, Prisma.ModelName.User)
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          email: '',
          phone: '',
          password: 'Abc1234!',
          status: UserStatus.ACTIVE,
          roles: [{id: '013f92b0-4a53-45cb-8eca-e66089a3919f'}],
          profile: {
            create: {
              firstName: '',
              middleName: '',
              lastName: '',
            },
          },
        },
      },
    },
  })
  async createUser(
    @Body()
    body: Prisma.UserCreateInput & {roles?: Role[]}
  ) {
    const {roles, ...user} = body;
    const userCreateInput: Prisma.UserCreateInput = user;
    // Construct roles.
    if (roles && roles.length > 0) {
      userCreateInput.roles = {
        connect: roles,
      };
    }

    return await this.prisma.user.create({
      data: userCreateInput,
      select: {
        id: true,
        email: true,
        phone: true,
        status: true,
        profile: true,
      },
    });
  }

  @Get('')
  @RequirePermission(PermissionAction.List, Prisma.ModelName.User)
  async getUsers(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('name') name?: string,
    @Query('roleId') roleId?: string
  ) {
    // [step 1] Construct where argument.
    let where: Prisma.UserWhereInput | undefined;
    const whereConditions: object[] = [];
    if (name) {
      name = name.trim();
      if (name.length > 0) {
        whereConditions.push({
          profile: {
            OR: [
              {firstName: {search: name}},
              {middleName: {search: name}},
              {lastName: {search: name}},
            ],
          },
        });
      }
    }

    if (roleId) {
      roleId = roleId.trim();
      if (verifyUuid(roleId)) {
        whereConditions.push({roles: {some: {id: roleId}}});
      }
    }

    if (whereConditions.length > 1) {
      where = {OR: whereConditions};
    } else if (whereConditions.length === 1) {
      where = whereConditions[0];
    } else {
      // where === undefined
    }

    // [step 2] Get users.
    const result = await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.User,
      pagination: {page, pageSize},
      findManyArgs: {
        where: where,
        include: {
          roles: true,
          profile: true,
        },
      },
    });

    // [step 3] Return users without password.
    result.records = result.records.map(user => {
      return this.userService.withoutPassword(user);
    });

    return result;
  }

  @Get(':userId')
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.User)
  async getUser(@Param('userId') userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {id: userId},
      include: {
        roles: true,
        profile: true,
      },
    });

    return this.userService.withoutPassword(user);
  }

  @Patch(':userId')
  @RequirePermission(PermissionAction.Update, Prisma.ModelName.User)
  @ApiBody({
    description:
      'Set roleIds with an empty array to remove all the roles of the user.',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          email: '',
          phone: '',
          profile: {
            update: {
              firstName: '',
              middleName: '',
              lastName: '',
            },
          },
        },
      },
    },
  })
  async updateUser(
    @Param('userId') userId: string,
    @Body()
    body: Prisma.UserUpdateInput & {roles?: Role[]}
  ): Promise<User> {
    const {roles, ...user} = body;
    const userUpdateInput: Prisma.UserUpdateInput = user;

    // Construct roles.
    if (roles && Array.isArray(roles)) {
      userUpdateInput.roles = {
        set: roles, // Overwrite the connections with roles.
      };
    }

    return await this.prisma.user.update({
      where: {id: userId},
      data: userUpdateInput,
    });
  }

  @Delete(':userId')
  @RequirePermission(PermissionAction.Delete, Prisma.ModelName.User)
  async deleteUser(@Param('userId') userId: string): Promise<User> {
    return await this.prisma.user.delete({
      where: {id: userId},
    });
  }

  @Get(':userId/profiles')
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.User)
  async getUserProfiles(@Param('userId') userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {id: userId},
      include: {profile: true},
    });

    return this.userService.withoutPassword(user);
  }

  @Get(':userId/roles')
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.User)
  async getUserRoles(@Param('userId') userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {id: userId},
      include: {roles: true},
    });

    return this.userService.withoutPassword(user);
  }

  @Patch(':userId/change-password')
  @RequirePermission(PermissionAction.Update, Prisma.ModelName.User)
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
      where: {id: userId},
    });
    const match = await compareHash(body.currentPassword, user.password);
    if (match === false) {
      throw new BadRequestException('The current password is incorrect.');
    }

    // [step 4] Change password.
    return await this.prisma.user.update({
      where: {id: userId},
      data: {password: body.newPassword},
      select: {id: true, email: true, phone: true},
    });
  }

  /* End */
}
