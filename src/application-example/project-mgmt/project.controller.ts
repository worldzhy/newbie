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
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {ProjectService} from '@microservices/project-mgmt/project/project.service';
import {verifyProjectName} from '@toolkit/validators/project.validator';

import {
  PermissionAction,
  Prisma,
  Project,
  ProjectCheckpointType,
  ProjectState,
} from '@prisma/client';
import {RequirePermission} from '@microservices/account/security/authorization/authorization.decorator';

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
  async getProjects(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('name') name?: string
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

    // [step 2] Get records.
    return await this.projectService.findManyWithPagination(
      {where},
      {page, pageSize}
    );
  }

  @Get(':projectId')
  async getProject(@Param('projectId') projectId: string): Promise<Project> {
    return await this.projectService.findUniqueOrThrow({
      where: {id: projectId},
    });
  }

  @Patch(':projectId')
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
  async deleteProject(@Param('projectId') projectId: string): Promise<Project> {
    return await this.projectService.delete({where: {id: projectId}});
  }

  //* Get checkpoints
  @Get(':projectId/checkpoints')
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
