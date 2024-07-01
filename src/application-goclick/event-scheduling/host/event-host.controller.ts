import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  Controller,
} from '@nestjs/common';
import {Prisma, User} from '@prisma/client';
import {verifyEmail} from '@toolkit/validators/user.validator';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {UserService} from '@microservices/account/user/user.service';
import {RoleService} from '@microservices/account/role/role.service';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@ApiTags('Event Scheduling / Event Host')
@ApiBearerAuth()
@Controller('event-hosts')
export class EventHostController {
  constructor(
    private readonly prisma: PrismaService,
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
              eventVenueIds: [1, 2],
              eventTypeIds: [1, 2],
              tagIds: [1, 2],
              quotaOfWeekMin: 6,
              quotaOfWeekMax: 8,
            },
          },
        },
      },
    },
  })
  async createEventHost(@Body() body: Prisma.UserCreateInput) {
    const userCreateInput: Prisma.UserCreateInput = body;

    // Construct roles.
    userCreateInput.roles = {connect: {name: RoleService.RoleName.EVENT_HOST}};

    return await this.prisma.user.create({
      data: userCreateInput,
      select: {
        id: true,
        email: true,
        phone: true,
        profile: true,
      },
    });
  }

  @Post('list')
  async getEventHosts(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Body()
    body?: {
      name?: string;
      muiFilter?: {
        items: {
          field: string;
          operator: string;
          id: number;
          value: string;
          fromInput: string;
        }[];
        logicOperator: string;
        quickFilterValues: [];
        quickFilterLogicOperator: string;
      };
    }
  ) {
    // [step 1] Construct where argument.
    const roleFilter = {roles: {some: {name: RoleService.RoleName.EVENT_HOST}}};
    const searchFilter = {};
    if (body) {
      if (body.name) {
        const name = body.name.trim();
        if (name.length > 0) {
          if (verifyEmail(name)) {
            searchFilter['email'] = name;
          } else {
            searchFilter['profile'] ??= {};
            searchFilter['profile']['fullName'] = {
              contains: name,
              mode: 'insensitive',
            };
          }
        }
      }
      if (body.muiFilter) {
        for (let i = 0; i < body.muiFilter.items.length; i++) {
          const item = body.muiFilter.items[i];
          if (item.field === 'eventVenueIds' && item.value) {
            const venue = await this.prisma.eventVenue.findFirst({
              where: {name: {[item.operator]: item.value, mode: 'insensitive'}},
              select: {id: true},
            });
            if (venue) {
              searchFilter['profile'] ??= {};
              searchFilter['profile']['eventVenueIds'] = {has: venue.id};
            }
          }
        }
      }
    }

    // [step 2] Get coaches.
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.User,
      pagination: {page, pageSize},
      findManyArgs: {
        where: {AND: [roleFilter, searchFilter]},
        select: {
          id: true,
          status: true,
          email: true,
          phone: true,
          profile: true,
        },
        orderBy: {profile: {fullName: 'asc'}},
      },
    });
  }

  @Get(':userId')
  async getEventHost(@Param('userId') userId: string) {
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
  async updateEventHost(
    @Param('userId') userId: string,
    @Body() body: Prisma.UserUpdateInput
  ) {
    const userUpdateInput: Prisma.UserUpdateInput = body;

    return await this.prisma.user.update({
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
  async deleteEventHost(@Param('userId') userId: string): Promise<User> {
    return await this.prisma.user.delete({
      where: {id: userId},
    });
  }

  /* End */
}
