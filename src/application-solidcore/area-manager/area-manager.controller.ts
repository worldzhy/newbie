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
import {RoleService} from '@microservices/account/role/role.service';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {UserService} from '@microservices/account/user/user.service';

@ApiTags('Area Manager')
@ApiBearerAuth()
@Controller('area-managers')
export class AreaManagerController {
  constructor(
    private prisma: PrismaService,
    private readonly userService: UserService
  ) {}

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
              tagIds: [1, 2],
              eventVenueIds: [1, 2],
              coachingTenure: 2,
            },
          },
        },
      },
    },
  })
  async createUser(
    @Body()
    body: Prisma.UserCreateInput
  ) {
    const userCreateInput: Prisma.UserCreateInput = body;
    // Construct roles.
    userCreateInput.roles = {connect: {name: RoleService.names.AREA_MANAGER}};

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
  async getUsers(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('name') name?: string
  ) {
    // [step 1] Construct where argument.
    let where: Prisma.UserWhereInput | undefined;
    const whereConditions: object[] = [];

    whereConditions.push({
      roles: {some: {name: RoleService.names.AREA_MANAGER}},
    });
    if (name) {
      name = name.trim();
      if (name.length > 0) {
        whereConditions.push({
          profile: {fullName: {contains: name, mode: 'insensitive'}},
        });
      }
    }

    if (whereConditions.length > 1) {
      where = {AND: whereConditions};
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
        where,
        include: {profile: true},
      },
    });

    // [step 4] Return users without password.
    result.records = result.records.map(user => {
      return this.userService.withoutPassword(user);
    });

    return result;
  }

  @Get(':userId')
  async getUser(@Param('userId') userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: {id: userId},
      include: {
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
              tags: ['experienced', 'patient'],
              eventVenueIds: [1, 2],
              coachingTenure: 2,
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

    return await this.prisma.user.update({
      where: {id: userId},
      data: userUpdateInput,
      include: {profile: true},
    });
  }

  @Delete(':userId')
  async deleteUser(@Param('userId') userId: string): Promise<User> {
    return await this.prisma.user.delete({
      where: {id: userId},
    });
  }

  /* End */
}
