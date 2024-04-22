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
  Req,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {Prisma, EventContainer} from '@prisma/client';
import {daysOfMonth} from '@toolkit/utilities/datetime.util';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {AccountService} from '@microservices/account/account.service';
import {RoleService} from '@microservices/account/role.service';
import {Request} from 'express';
import _ from 'lodash';

@ApiTags('Event Scheduling / Event Container')
@ApiBearerAuth()
@Controller('event-containers')
export class EventContainerController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accountService: AccountService,
    private readonly roleService: RoleService
  ) {}

  @Get('days-of-month')
  getDaysOfMonth(@Query('year') year: number, @Query('month') month: number) {
    return daysOfMonth(year, month);
  }

  @Post('')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          year: 2023,
          month: 8,
          venueId: 1,
        },
      },
    },
  })
  async createEventContainer(
    @Body()
    body: Prisma.EventContainerUncheckedCreateInput
  ): Promise<EventContainer> {
    return await this.prisma.eventContainer.create({
      data: body,
    });
  }

  @Post('filter')
  async getEventContainersByFilter(
    @Req() req: Request,
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
    const user = await this.accountService.me(req);
    const isAdmin = await this.roleService.isAdmin(user.id);

    // [step 1] Construct where argument.
    const searchFilter = {};
    if (body) {
      if (body.name) {
        const name = body.name.trim();
        if (name.length > 0) {
          searchFilter['name'] = {contains: name, mode: 'insensitive'};
        }
      }
      if (body.muiFilter) {
        for (let i = 0; i < body.muiFilter.items.length; i++) {
          const item = body.muiFilter.items[i];
          if (item.field === 'venue' && item.value) {
            const venues = await this.prisma.eventVenue.findMany({
              where: {name: {[item.operator]: item.value, mode: 'insensitive'}},
              select: {id: true},
            });
            searchFilter['venueId'] = {in: venues.map(d => d.id)};
          } else {
            searchFilter['venueId'] = undefined;
          }
        }
      }
    }

    if (isAdmin === false) {
      if (
        !user.profile ||
        (user.profile && user.profile.eventVenueIds.length === 0)
      ) {
        return [];
      } else {
        if (searchFilter['venueId']) {
          searchFilter['venueId'] = {
            in: _.intersection(
              user.profile.eventVenueIds,
              searchFilter['venueId'].in
            ),
          };
        } else {
          searchFilter['venueId'] = {in: user.profile.eventVenueIds};
        }
      }
    } else {
      // Do nothing if the user is an admin.
    }

    // [step 2] Get event containers.
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.EventContainer,
      pagination: {page, pageSize},
      findManyArgs: {
        where: {...searchFilter},
        orderBy: {updatedAt: 'desc'},
      },
    });
  }

  @Get('')
  async getEventContainers(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('name') name?: string,
    @Query('venueId') venueId?: number,
    @Query('year') year?: number,
    @Query('month') month?: number
  ) {
    // [step 1] Construct where argument.
    const where: Prisma.EventContainerWhereInput = {};
    if (name && name.trim()) where.name = name.trim();
    if (venueId) where.venueId = venueId;
    if (year) where.year = year;
    if (month) where.month = month;

    // const orderBy: Prisma.EventContainerOrderByWithRelationAndSearchRelevanceInput =
    //   {year: 'desc', month: 'desc', name: 'asc'};

    // [step 2] Get eventContainers.
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.EventContainer,
      pagination: {page, pageSize},
      findManyArgs: {where},
    });
  }

  @Get(':eventContainerId')
  async getEventContainer(@Param('eventContainerId') eventContainerId: number) {
    const container = await this.prisma.eventContainer.findUniqueOrThrow({
      where: {id: eventContainerId},
      include: {venue: true},
    });

    const place = await this.prisma.place.findUniqueOrThrow({
      where: {id: container['venue']['placeId'] ?? undefined},
      select: {timeZone: true},
    });

    container['venue']['timeZone'] = place.timeZone;
    return container;
  }

  @Patch(':eventContainerId')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          year: 2023,
          month: 8,
          venueId: 1,
        },
      },
    },
  })
  async updateEventContainer(
    @Param('eventContainerId') eventContainerId: number,
    @Body()
    body: Prisma.EventContainerUncheckedUpdateInput
  ): Promise<EventContainer> {
    const container = await this.prisma.eventContainer.findUniqueOrThrow({
      where: {id: eventContainerId},
      include: {events: true},
    });

    if (container['events'].length > 0) {
      throw new BadRequestException('Already started to schedule.');
    }

    return await this.prisma.eventContainer.update({
      where: {id: eventContainerId},
      data: body,
    });
  }

  @Delete(':eventContainerId')
  async deleteEventContainer(
    @Param('eventContainerId') eventContainerId: number
  ): Promise<EventContainer> {
    return await this.prisma.eventContainer.delete({
      where: {id: eventContainerId},
    });
  }

  /* End */
}