import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiResponse} from '@nestjs/swagger';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {NoGuard} from '@microservices/account/security/passport/public/public.decorator';
import {GoClickService} from '@microservices/go-click/go-click.service';
import {
  constructDateTime,
  datePlusMinutes,
  sameWeekdaysOfMonth,
} from '@toolkit/utilities/datetime.util';
import * as moment from 'moment';
import {
  Prisma,
  Event,
  EventChangeLogType,
  EventIssueStatus,
} from '@prisma/client';
import {EventIssueService} from '@microservices/event-scheduling/event-issue.service';
import {RoleService} from '@microservices/account/role.service';
import {
  GoClickGroupCreateReqDto,
  GoClickGroupUpdateReqDto,
  GoClickItemCreateReqDto,
  GoClickItemUpdateReqDto,
} from '@microservices/go-click/go-click.dto';
import {CommonCUDResDto} from '@/dto/common';
import {
  GoClickGroupListReqDto,
  GoClickGroupListResDto,
  GoClickItemListReqDto,
  GoClickItemListResDto,
  GoClickTreeResDto,
} from './go-click.dto';

@ApiTags('GoClick')
@ApiBearerAuth()
@Controller('go-click')
export class GoClickController {
  constructor(
    private goClickService: GoClickService,
    private readonly eventIssueService: EventIssueService,
    private readonly prisma: PrismaService
  ) {}

  @NoGuard()
  @Get('group/list')
  @ApiResponse({
    type: GoClickGroupListResDto,
  })
  async groupList(@Query() query: GoClickGroupListReqDto) {
    const {page, pageSize, id} = query;
    return this.prisma.findManyInManyPages({
      model: Prisma.ModelName.GoClickGroup,
      pagination: {page, pageSize},
      findManyArgs: {
        where: {
          deletedAt: null,
          id,
        },
        orderBy: {
          sort: 'desc',
        },
      },
    });
  }

  @NoGuard()
  @Post('group/create')
  @ApiResponse({
    type: CommonCUDResDto,
  })
  async groupCreate(
    @Body()
    body: GoClickGroupCreateReqDto
  ) {
    return await this.goClickService.groupCreate(body);
  }

  @NoGuard()
  @Post('group/update')
  @ApiResponse({
    type: CommonCUDResDto,
  })
  async groupUpdate(
    @Body()
    body: GoClickGroupUpdateReqDto
  ) {
    return await this.goClickService.groupUpdate(body);
  }

  @NoGuard()
  @Post('group/delete')
  @ApiResponse({
    type: CommonCUDResDto,
  })
  async groupDelete(
    @Body()
    body: GoClickGroupUpdateReqDto
  ) {
    return await this.goClickService.groupDelete(body);
  }

  @NoGuard()
  @Get('item/list')
  @ApiResponse({
    type: GoClickItemListResDto,
  })
  async itemList(@Query() query: GoClickItemListReqDto) {
    const {page, pageSize, id, ...rest} = query;
    return this.prisma.findManyInManyPages({
      model: Prisma.ModelName.GoClickItem,
      pagination: {page, pageSize},
      findManyArgs: {
        where: {
          deletedAt: null,
          id,
          ...rest,
        },
        orderBy: {
          sort: 'desc',
        },
      },
    });
  }

  @NoGuard()
  @Get('tree')
  @ApiResponse({
    type: GoClickTreeResDto,
    isArray: true,
  })
  async tree() {
    const groups = await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.GoClickGroup,
      pagination: {page: 0, pageSize: 10000},
      findManyArgs: {
        where: {
          deletedAt: null,
        },
        orderBy: {
          sort: 'desc',
        },
      },
    });
    const items = await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.GoClickItem,
      pagination: {page: 0, pageSize: 1000},
      findManyArgs: {
        where: {
          deletedAt: null,
        },
        orderBy: {
          sort: 'desc',
        },
      },
    });

    const groupMap = {};

    groups.records.forEach(groupItem => {
      groupMap[groupItem.id] = {...groupItem, items: [], child: []};
    });
    items.records.forEach(itemItem => {
      if (groupMap[itemItem.groupId]) {
        groupMap[itemItem.groupId].items.push(itemItem);
      }
    });

    Object.keys(groupMap).forEach(groupId => {
      if (groupMap[groupId].parentId !== 0) {
        groupMap[groupMap[groupId].parentId].child.push(groupMap[groupId]);
      }
    });

    return Object.keys(groupMap)
      .map(groupId => groupMap[groupId])
      .filter(group => group.parentId === 0);
  }

  @NoGuard()
  @Post('item/create')
  @ApiResponse({
    type: CommonCUDResDto,
  })
  async itemCreate(
    @Body()
    body: GoClickItemCreateReqDto
  ) {
    return await this.goClickService.itemCreate(body);
  }

  @NoGuard()
  @Post('item/update')
  @ApiResponse({
    type: CommonCUDResDto,
  })
  async itemUpdate(
    @Body()
    body: GoClickItemUpdateReqDto
  ) {
    return await this.goClickService.itemUpdate(body);
  }

  @NoGuard()
  @Post('item/delete')
  @ApiResponse({
    type: CommonCUDResDto,
  })
  async itemDelete(
    @Body()
    body: GoClickItemUpdateReqDto
  ) {
    return await this.goClickService.itemDelete(body);
  }

  @Post('init-google-drive-example')
  @NoGuard()
  async initGoogleDriveExample() {
    return await this.goClickService.initGoogleDriveExample();
  }

  @Post('init-workflow-example')
  @NoGuard()
  async initWorkflowExample() {
    const old = await this.prisma.workflow.findFirst({
      where: {name: 'Example'},
    });
    if (old) {
      await this.prisma.workflow.delete({
        where: {id: old.id},
      });
    }
    const example = await await this.prisma.workflow.create({
      data: {
        name: 'Example',
        description: 'Example workflow',
      },
    });
    const views: any = [
      {
        name: 'Node Root',
        workflowId: example.id,
      },
      {
        name: 'Node 1',
        workflowId: example.id,
      },
      {
        name: 'Node 2',
        workflowId: example.id,
      },
      {
        name: 'Node 3',
        workflowId: example.id,
      },
      {
        name: 'Node 4',
        workflowId: example.id,
      },
    ];
    for (let i = 0; i < views.length; i++) {
      const workflowView = await this.prisma.workflowView.create({
        data: views[i],
      });
      views[i].id = workflowView.id;
    }

    const comps: any = [
      {
        viewId: views[0].id,
        type: 'INFO_Title',
        properties: {value: 'This is Node Root'},
        sort: 0,
      },
      {
        viewId: views[1].id,
        type: 'INFO_Title',
        properties: {value: 'This is Node 1'},
        sort: 0,
      },
      {
        viewId: views[2].id,
        type: 'INFO_Title',
        properties: {value: 'This is Node 2'},
        sort: 0,
      },
      {
        viewId: views[3].id,
        type: 'INFO_Title',
        properties: {value: 'This is Node 3'},
        sort: 0,
      },
      {
        viewId: views[4].id,
        type: 'INFO_Title',
        properties: {value: 'This is Node 4'},
        sort: 0,
      },
    ];

    for (let i = 0; i < comps.length; i++) {
      const comp = await this.prisma.workflowViewComponent.create({
        data: comps[i],
      });
      comps[i].id = comp.id;
    }

    const workflowStateNext = await this.prisma.workflowState.create({
      data: {
        workflowId: example.id,
        name: 'Next',
        description: 'to next',
      },
    });
    const workflowStateBack = await this.prisma.workflowState.create({
      data: {
        workflowId: example.id,
        name: 'Back Root',
        description: 'back root',
      },
    });

    await this.prisma.workflowRoute.createMany({
      data: [
        // root -> node 1
        {
          startSign: true,
          viewId: views[0].id,
          stateId: workflowStateNext.id,
          nextViewId: views[1].id,
        },
        // node 1  -> node 2
        {
          startSign: false,
          viewId: views[1].id,
          stateId: workflowStateNext.id,
          nextViewId: views[2].id,
        },
        // node 2 -> node 3
        {
          startSign: false,
          viewId: views[2].id,
          stateId: workflowStateNext.id,
          nextViewId: views[3].id,
        },
        // node 3 -> node 4
        {
          startSign: false,
          viewId: views[3].id,
          stateId: workflowStateNext.id,
          nextViewId: views[4].id,
        },
        // root <- node 4
        {
          startSign: false,
          viewId: views[4].id,
          stateId: workflowStateBack.id,
          nextViewId: views[0].id,
        },
      ],
    });
  }

  /** copy from event.controller */
  async createEvent(
    @Body()
    body: Prisma.EventUncheckedCreateInput & {needToDuplicate?: boolean}
  ): Promise<Event> {
    if (!body.hostUserId) {
      throw new BadRequestException('hostUserId is required.');
    }

    // [step 1] Create event.
    const eventType = await this.prisma.eventType.findUniqueOrThrow({
      where: {id: body.typeId},
    });
    body.minutesOfDuration = eventType.minutesOfDuration;

    const {needToDuplicate} = body;

    delete body.needToDuplicate;
    const event = await this.prisma.event.create({
      data: body,
      include: {type: true},
    });

    // [step 2] Note add event.
    await this.prisma.eventChangeLog.create({
      data: {
        type: EventChangeLogType.USER,
        description:
          'New class: ' + eventType.name + ' at ' + body.datetimeOfStart,
        eventContainerId: body.containerId,
        eventId: event.id,
      },
    });

    // [step 3] Check event issues.
    await this.eventIssueService.check(event);

    // [step 4] Attach information.
    event['issues'] = await this.prisma.eventIssue.findMany({
      where: {status: EventIssueStatus.UNREPAIRED, eventId: event.id},
    });
    event['hostUser'] = await this.prisma.userSingleProfile.findUniqueOrThrow({
      where: {userId: body.hostUserId},
      select: {userId: true, fullName: true, eventHostTitle: true},
    });

    // [step 5] Duplicate events.
    if (needToDuplicate) {
      const sameWeekdays = sameWeekdaysOfMonth(
        event.year,
        event.month,
        event.dayOfMonth
      );
      for (let i = 0; i < sameWeekdays.length; i++) {
        const sameWeekDay = sameWeekdays[i];
        if (sameWeekDay.dayOfMonth === event.dayOfMonth) {
          continue;
        }

        const newDatetimeOfStart = constructDateTime(
          sameWeekDay.year,
          sameWeekDay.month,
          sameWeekDay.dayOfMonth,
          event.hour,
          event.minute,
          0,
          event.timeZone
        );
        const newDatetimeOfEnd = datePlusMinutes(
          newDatetimeOfStart,
          eventType.minutesOfDuration
        );

        // Check if there is another event around this period.
        if (
          (await this.prisma.event.count({
            where: {
              containerId: body.containerId,
              datetimeOfStart: {lt: newDatetimeOfEnd},
              datetimeOfEnd: {gt: newDatetimeOfStart},
            },
          })) > 0
        ) {
          continue;
        }

        const newOtherEvent = await this.prisma.event.create({
          data: {
            hostUserId: event.hostUserId,
            datetimeOfStart: newDatetimeOfStart,
            minutesOfDuration: event.minutesOfDuration,
            timeZone: event.timeZone,
            typeId: event.typeId,
            venueId: event.venueId,
            containerId: event.containerId,
          } as Prisma.EventUncheckedCreateInput,
        });

        // Note the update.
        await this.prisma.eventChangeLog.create({
          data: {
            type: EventChangeLogType.USER,
            description:
              'New class: ' +
              eventType.name +
              ' at ' +
              newOtherEvent.datetimeOfStart,
            eventContainerId: newOtherEvent.containerId,
            eventId: newOtherEvent.id,
          },
        });
      }
    }

    return event;
  }

  @Post('init-schedule-example')
  @NoGuard()
  async initExample() {
    const user = await this.prisma.user.findFirst({
      where: {roles: {some: {name: RoleService.RoleName.EVENT_HOST}}},
      select: {
        id: true,
      },
    });
    if (!user) {
      throw new BadRequestException('Not found Host.');
    }
    const eventType = await this.prisma.eventType.findFirst();
    if (!eventType) {
      throw new BadRequestException('Not found EventType.');
    }

    const eventVenue = await this.prisma.eventVenue.findFirst();
    if (!eventVenue) {
      throw new BadRequestException('Not found EventVenue.');
    }

    await this.prisma.eventContainer.deleteMany({
      where: {
        name: {startsWith: 'Example'},
      },
    });

    const currentDate = moment();
    const year = currentDate.year();
    const month = currentDate.month() + 1;
    const eventContainer = await this.prisma.eventContainer.create({
      data: {
        name: `Example ${year}-${month}`,
        year: year,
        month: month,
        venueId: eventVenue.id,
      },
    });
    const common = {
      year: year,
      month: month,
      typeId: eventType.id,
      venueId: eventVenue.id,
      hostUserId: user.id,
      containerId: eventContainer.id,
      needToDuplicate: true,
      timeZone: 'America/Los_Angeles',
    };
    const datetimeOfStarts = [
      `${currentDate.format('YYYY-MM')}-03T05:15:00-07:00`,
      `${currentDate.format('YYYY-MM')}-04T06:15:00-07:00`,
      `${currentDate.format('YYYY-MM')}-01T05:45:00-07:00`,
      `${currentDate.format('YYYY-MM')}-05T14:15:00-07:00`,
      `${currentDate.format('YYYY-MM')}-07T08:15:00-07:00`,
      `${currentDate.format('YYYY-MM')}-09T10:30:00-07:00`,
      `${currentDate.format('YYYY-MM')}-08T10:30:00-07:00`,
      `${currentDate.format('YYYY-MM')}-10T11:45:00-07:00`,
      `${currentDate.format('YYYY-MM')}-13T14:15:00-07:00`,
      `${currentDate.format('YYYY-MM')}-13T05:15:00-07:00`,
      `${currentDate.format('YYYY-MM')}-14T15:45:00-07:00`,
      `${currentDate.format('YYYY-MM')}-16T16:45:00-07:00`,
      `${currentDate.format('YYYY-MM')}-19T08:15:00-07:00`,
      `${currentDate.format('YYYY-MM')}-21T14:30:00-07:00`,
      `${currentDate.format('YYYY-MM')}-22T09:45:00-07:00`,
      `${currentDate.format('YYYY-MM')}-23T18:15:00-07:00`,
      `${currentDate.format('YYYY-MM')}-24T17:30:00-07:00`,
    ];
    for (const d of datetimeOfStarts) {
      await this.createEvent({...common, datetimeOfStart: d} as any);
    }
    return 'ok';
  }
}
