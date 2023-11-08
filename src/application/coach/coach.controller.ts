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
import {RoleService} from '@microservices/account/role/role.service';

const DEFAULT_PASSWORD = 'x8nwFP814HIk!';

@ApiTags('Coach')
@ApiBearerAuth()
@Controller('coaches')
export class CoachController {
  constructor(
    private userService: UserService,
    private roleService: RoleService
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
              eventVenueIds: [1, 2],
              eventTypeIds: [1, 2],
              tagIds: [1, 2],
              coachingTenure: 2,
              quotaOfWeek: 4,
              quotaOfWeekMinPreference: 6,
              quotaOfWeekMaxPreference: 8,
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
    userCreateInput.roles = {connect: {name: RoleService.names.COACH}};

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
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('name') name?: string
  ) {
    // [step 1] Construct where argument.
    let where: Prisma.UserWhereInput | undefined;
    const whereConditions: object[] = [];

    whereConditions.push({roles: {some: {name: RoleService.names.COACH}}});
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

    // [step 2] Get coaches.
    const result = await this.userService.findManyInManyPages(
      {page, pageSize},
      {
        where,
        include: {profile: true},
        orderBy: {profile: {fullName: 'asc'}},
      }
    );
    const coaches = result.records as User[];

    // [step 3] Return users without password.
    result.records = coaches.map(coach => {
      return this.userService.withoutPassword(coach);
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
              eventVenueIds: [1, 2],
              eventTypeIds: [1, 2],
              tagIds: [1, 2],
              coachingTenure: 3,
              quotaOfWeek: 4,
              quotaOfWeekMinPreference: 8,
              quotaOfWeekMaxPreference: 10,
            },
          },
          roles: {connect: {id: 'fd5c948e-d15d-48d6-a458-7798e4d9921c'}},
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

  @Patch(':userId/role-area-manager')
  async addAreaManagerRole(@Param('userId') userId: string): Promise<User> {
    const role = await this.roleService.findUniqueOrThrow({
      where: {name: RoleService.names.AREA_MANAGER},
    });

    return await this.userService.update({
      where: {id: userId},
      data: {
        password: DEFAULT_PASSWORD,
        roles: {connect: {id: role.id}},
      },
      select: {
        id: true,
        email: true,
        phone: true,
        profile: true,
      },
    });
  }

  /* End */
}
