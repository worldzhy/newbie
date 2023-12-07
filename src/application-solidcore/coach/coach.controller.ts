import {
  Req,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  Controller,
} from '@nestjs/common';
import {Request} from 'express';
import {
  currentQuarter,
  firstDayOfQuarter,
} from '@toolkit/utilities/datetime.util';
import {Prisma, User} from '@prisma/client';
import {verifyEmail} from '@toolkit/validators/user.validator';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {UserService} from '@microservices/account/user/user.service';
import {RoleService} from '@microservices/account/role/role.service';
import {AccountService} from '@microservices/account/account.service';
import {AvailabilityExpressionService} from '@microservices/event-scheduling/availability-expression.service';

const DEFAULT_PASSWORD = 'x8nwFP814HIk!';

@ApiTags('Coach')
@ApiBearerAuth()
@Controller('coaches')
export class CoachController {
  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private readonly accountService: AccountService,
    private availabilityExpressionService: AvailabilityExpressionService
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
        if (verifyEmail(name)) {
          whereConditions.push({email: name});
        } else {
          whereConditions.push({
            profile: {fullName: {contains: name, mode: 'insensitive'}},
          });
        }
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

    // [step 3] Attach availability information.
    const thisYear = new Date().getFullYear();
    const thisQuarter = currentQuarter();
    for (let i = 0; i < coaches.length; i++) {
      const coach = coaches[i];
      // Attach current quarter availability status.
      const expOfCurrentQuarter =
        await this.availabilityExpressionService.findFirst({
          where: {
            hostUserId: coach.id,
            dateOfOpening: firstDayOfQuarter(thisYear, thisQuarter),
          },
        });
      coach['profile']['availabilityOfCurrentQuarter'] = 'None';
      if (expOfCurrentQuarter) {
        coach['profile']['availabilityOfCurrentQuarter'] =
          expOfCurrentQuarter.status;
      }

      // Attach next quarter availability status.
      let nextYear = thisYear;
      let nextQuarter = thisQuarter;
      if (thisQuarter === 4) {
        nextYear += 1;
        nextQuarter = 1;
      } else {
        nextQuarter += 1;
      }
      const expOfNextQuarter =
        await this.availabilityExpressionService.findFirst({
          where: {
            hostUserId: coach.id,
            dateOfOpening: firstDayOfQuarter(nextYear, nextQuarter),
          },
        });
      coach['profile']['availabilityOfNextQuarter'] = 'None';
      if (expOfNextQuarter) {
        coach['profile']['availabilityOfNextQuarter'] = expOfNextQuarter.status;
      }
    }

    // [step 4] Return users without password.
    result.records = coaches.map(coach => {
      return this.userService.withoutPassword(coach);
    });

    return result;
  }

  @Get('/personal')
  async getPersonalCoaches(
    @Req() request: Request,
    @Query('venueId') venueId: number
  ) {
    // [step 1] Get user info.
    const user: any = await this.accountService.me(request);
    const isAdmin = !!user?.roles?.find(({name}) => name === RoleService.names.ADMIN);
    const eventVenueIds = user?.profile?.eventVenueIds ?? [];

    if (!isAdmin && !eventVenueIds.includes(venueId)) {
      return [];
    }

    // [step 2] Get coaches.
    const result: User[] = await this.userService.findMany(
      {
        where: {roles: {some: {name: RoleService.names.COACH}}, profile: {eventVenueIds: {has: venueId}}},
        include: {profile: true},
        orderBy: {profile: {fullName: 'asc'}},
      }
    );

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
