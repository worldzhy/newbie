import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  BadRequestException,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import {ProjectService} from './project.service';
import {verifyProjectName} from '../../../toolkit/validators/project.validator';

import {
  PermissionAction,
  Prisma,
  Project,
  ProjectCheckpointType,
  ProjectState,
} from '@prisma/client';
import {
  generatePaginationParams,
  generatePaginationResponse,
} from '../../../toolkit/pagination/pagination';
import {RequirePermission} from '../../../microservices/account/authorization/authorization.decorator';

@ApiTags('Project Management / Project')
@ApiBearerAuth()
@Controller('projects')
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Post('')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'Galaxy',
        },
      },
    },
  })
  async createProject(
    @Body()
    body: Prisma.ProjectCreateInput
  ): Promise<Project> {
    // [step 1] Guard statement.
    if (!body.name || !verifyProjectName(body.name)) {
      throw new BadRequestException(
        'Invalid project name in the request body.'
      );
    }

    // [step 2] Create project.
    return await this.projectService.create({
      data: {
        name: body.name,
        state: ProjectState.DESIGNING,
        checkpoints: {
          createMany: {
            skipDuplicates: true,
            data: Object.values(ProjectCheckpointType).map(checkpointType => {
              return {type: checkpointType};
            }),
          },
        },
      },
    });
  }

  @Get('')
  @RequirePermission(PermissionAction.List, Prisma.ModelName.Project)
  @ApiQuery({name: 'name', type: 'string'})
  @ApiQuery({name: 'page', type: 'number'})
  @ApiQuery({name: 'pageSize', type: 'number'})
  async getProjects(
    @Query('name') name?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    // [step 1] Construct where argument.
    let where: Prisma.ProjectWhereInput | undefined;
    const whereConditions: object[] = [];
    if (name) {
      name = name.trim();
      if (name.length > 0) {
        whereConditions.push({name: {contains: name}});
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
    const {take, skip} = generatePaginationParams({
      page: page,
      pageSize: pageSize,
    });

    const [records, total] = await this.projectService.findManyWithTotal({
      where: where,
      take: take,
      skip: skip,
    });

    return generatePaginationResponse({records, total, page, pageSize});
  }

  @Get(':projectId')
  @ApiParam({
    name: 'projectId',
    schema: {type: 'string'},
    description: 'The uuid of the project.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getProject(
    @Param('projectId') projectId: string
  ): Promise<Project | null> {
    return await this.projectService.findUnique({
      where: {id: projectId},
    });
  }

  @Patch(':projectId')
  @ApiParam({
    name: 'projectId',
    schema: {type: 'string'},
    description: 'The uuid of the project.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          name: 'Galaxy',
        },
      },
    },
  })
  async updateProject(
    @Param('projectId') projectId: string,
    @Body() body: Prisma.ProjectUpdateInput
  ): Promise<Project> {
    return await this.projectService.update({
      where: {id: projectId},
      data: body,
    });
  }

  @Delete(':projectId')
  @ApiParam({
    name: 'projectId',
    schema: {type: 'string'},
    description: 'The uuid of the project.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async deleteProject(@Param('projectId') projectId: string): Promise<Project> {
    return await this.projectService.delete({where: {id: projectId}});
  }

  //* Get checkpoints
  @Get(':projectId/checkpoints')
  @ApiParam({
    name: 'projectId',
    schema: {type: 'string'},
    description: 'The uuid of the project.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getProjectCheckpoints(
    @Param('projectId') projectId: string
  ): Promise<Project> {
    return await this.projectService.findUniqueOrThrow({
      where: {id: projectId},
      include: {checkpoints: true},
    });
  }

  //* Get environments
  @Get(':projectId/environments')
  @ApiParam({
    name: 'projectId',
    schema: {type: 'string'},
    description: 'The uuid of the project.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getProjectEnvironments(
    @Param('projectId') projectId: string
  ): Promise<Project> {
    return await this.projectService.findUniqueOrThrow({
      where: {id: projectId},
      include: {environments: true},
    });
  }

  /* End */
}
