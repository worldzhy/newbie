import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {Prisma, User} from '@prisma/client';
import {UserService} from '@microservices/account/user/user.service';

const ROLE_NAME_COACH = 'Coach';

@ApiTags('Coach')
@ApiBearerAuth()
@Controller('coaches')
export class CoachController {
  constructor(private userService: UserService) {}

  @Post('')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          email: '',
          phone: '',
          profile: {
            create: {
              firstName: '',
              middleName: '',
              lastName: '',
              venueIds: [1, 2],
              tagIds: [1, 2],
            },
          },
        },
      },
    },
  })
  async createUser(
    @Body()
    body: Prisma.UserCreateInput
  ): Promise<User> {
    const userCreateInput: Prisma.UserCreateInput = body;

    // Construct roles.
    userCreateInput.roles = {connect: {name: ROLE_NAME_COACH}};

    return await this.userService.create({
      data: userCreateInput,
      select: {
        id: true,
        email: true,
        phone: true,
        profile: true,
      },
    });
  }

  @Get('')
  async getUsers(
    @Query('name') name?: string,
    @Query('venueId') venueId?: number,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    // [step 1] Construct where argument.
    let where: Prisma.UserWhereInput = {
      profile: {
        fullName: name?.trim()
          ? {contains: name.trim(), mode: 'insensitive'}
          : undefined,
        venueIds: venueId ? {has: venueId} : undefined,
      },
      roles: {some: {name: ROLE_NAME_COACH}},
    };

    // [step 2] Get users.
    const result = await this.userService.findManyWithPagination(
      {
        where: where,
        include: {
          roles: true,
          profile: true,
        },
      },
      {page, pageSize}
    );

    // [step 4] Return users without password.
    result.records = result.records.map(user => {
      return this.userService.withoutPassword(user);
    });

    return result;
  }

  @Get(':userId')
  async getUser(@Param('userId') userId: string) {
    const user = await this.userService.findUniqueOrThrow({
      where: {id: userId},
      include: {
        roles: true,
        profile: true,
      },
    });

    return this.userService.withoutPassword(user);
  }

  @Patch(':userId')
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
              locationIds: [1, 2],
              tagIds: [1, 2],
            },
          },
        },
      },
    },
  })
  async updateUser(
    @Param('userId') userId: string,
    @Body()
    body: Prisma.UserUpdateInput
  ): Promise<User> {
    const userUpdateInput: Prisma.UserUpdateInput = body;

    return await this.userService.update({
      where: {id: userId},
      data: userUpdateInput,
      select: {
        id: true,
        email: true,
        phone: true,
        profile: true,
      },
    });
  }

  @Delete(':userId')
  async deleteUser(@Param('userId') userId: string): Promise<User> {
    return await this.userService.delete({
      where: {id: userId},
    });
  }

  /* End */
}
