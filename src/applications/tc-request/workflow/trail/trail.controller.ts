import {
  Controller,
  Delete,
  Get,
  Patch,
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
import {TcWorkflowTrailService} from './trail.service';
import {Prisma, TcWorkflowTrail, PermissionAction} from '@prisma/client';
import {RequirePermission} from '../../../account/authorization/authorization.decorator';
import {RoleService} from '../../../account/user/role/role.service';
import {UserService} from '../../../account/user/user.service';

@ApiTags('[Application] Tc Request / Workflow / Trail')
@ApiBearerAuth()
@Controller('tc-workflow-trails')
export class TcWorkflowTrailController {
  private workflowTrailService = new TcWorkflowTrailService();
  private userService = new UserService();
  private roleService = new RoleService();

  @Get('')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.TcWorkflowTrail)
  @ApiQuery({name: 'workflowId', type: 'string'})
  @ApiQuery({name: 'page', type: 'number'})
  @ApiQuery({name: 'pageSize', type: 'number'})
  async getWorkflowTrails(
    @Query()
    query: {
      workflowId?: string;
      page?: string;
      pageSize?: string;
    }
  ): Promise<TcWorkflowTrail[]> {
    // [step 1] Construct where argument.
    let where: Prisma.TcWorkflowTrailWhereInput | undefined;
    if (query.workflowId) {
      where = {workflowId: query.workflowId};
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

    // [step 3] Get workflow trails.
    const trails = await this.workflowTrailService.findMany({
      where: where,
      take: take,
      skip: skip,
      orderBy: {createdAt: 'desc'},
    });

    // [step 4] Process before return.
    for (let i = 0; i < trails.length; i++) {
      const trail = trails[i];
      // Attach processedByUser's username.
      if (trail.processedByUserId) {
        const user = await this.userService.findUniqueOrThrow({
          where: {id: trail.processedByUserId},
          select: {username: true},
        });
        trail['processedByUser'] = user.username;
      }

      // Attach next role name
      if (trail.nextRoleId) {
        const role = await this.roleService.findUniqueOrThrow({
          where: {id: trail.nextRoleId},
          select: {name: true},
        });
        trail['nextRole'] = role.name;
      }
    }

    return trails;
  }

  @Get(':trailId')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.TcWorkflowTrail)
  @ApiParam({
    name: 'trailId',
    schema: {type: 'number'},
    example: 1,
  })
  async getWorkflowTrail(
    @Param('trailId') trailId: string
  ): Promise<TcWorkflowTrail | null> {
    return await this.workflowTrailService.findUnique({
      where: {id: parseInt(trailId)},
    });
  }

  @Patch(':trailId')
  @RequirePermission(PermissionAction.update, Prisma.ModelName.TcWorkflowTrail)
  @ApiParam({
    name: 'trailId',
    schema: {type: 'number'},
    example: 1,
  })
  @ApiBody({
    description: 'Update environment variables.',
    examples: {
      a: {
        summary: '1. Without AWS profile',
        value: {
          awsAccountId: '929553487761',
          awsAccessKeyId: 'fakeAKIXXXXXQB3I56H72',
          awsSecretAccessKey: 'fakeNyXXXXXXXXXrBJk7LUEhXBqHKxG4PiCJ6cQ',
          awsRegion: 'us-east-1',
        },
      },
      b: {
        summary: '2. With AWS profile',
        value: {
          awsAccountId: '929555287761',
          awsProfile: 'InceptionPad',
          awsRegion: 'us-east-1',
        },
      },
    },
  })
  async updateWorkflowTrail(
    @Param('trailId') trailId: string,
    @Body() body: Prisma.TcWorkflowTrailUpdateInput
  ): Promise<TcWorkflowTrail> {
    return await this.workflowTrailService.update({
      where: {id: parseInt(trailId)},
      data: body,
    });
  }

  @Delete(':trailId')
  @RequirePermission(PermissionAction.delete, Prisma.ModelName.TcWorkflowTrail)
  @ApiParam({
    name: 'trailId',
    schema: {type: 'number'},
    example: 1,
  })
  async deleteWorkflowTrail(
    @Param('trailId') trailId: string
  ): Promise<TcWorkflowTrail> {
    return await this.workflowTrailService.delete({
      where: {id: parseInt(trailId)},
    });
  }

  /* End */
}
