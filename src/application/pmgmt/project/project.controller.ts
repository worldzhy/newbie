import {Controller, Get, Post, Param, Body, Patch} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {ProjectService} from './project.service';
import {CheckpointService} from '../checkpoint/checkpoint.service';
import {EnvironmentService} from '../environment/environment.service';
import {verifyProjectName} from '../../../toolkits/validators/project.validator';

import {
  Prisma,
  Project,
  ProjectCheckpoint,
  ProjectCheckpointType,
  ProjectEnvironment,
  ProjectEnvironmentType,
  ProjectState,
} from '@prisma/client';

@ApiTags('[Application] Project Management / Project')
@ApiBearerAuth()
@Controller('project-management')
export class ProjectController {
  private projectService = new ProjectService();
  private checkpointService = new CheckpointService();
  private environmentService = new EnvironmentService();

  @Post('projects')
  @ApiBody({
    description:
      "The 'projectName', 'clientName' and 'clientEmail' are required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'Galaxy',
          clientName: 'Henry Zhao',
          clientEmail: 'henry@inceptionpad.com',
        },
      },
    },
  })
  async createProject(
    @Body()
    body: Prisma.ProjectCreateInput
  ): Promise<Project | {err: {message: string}}> {
    // [step 1] Guard statement.
    if (!body.name || !verifyProjectName(body.name)) {
      return {
        err: {
          message: 'Please provide valid project name in the request body.',
        },
      };
    }

    // [step 2] Create project.
    return await this.projectService.create({
      name: body.name,
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      state: ProjectState.DESIGNING,
      checkpoints: {
        createMany: {
          skipDuplicates: true,
          data: Object.values(ProjectCheckpointType).map(checkpointType => {
            return {type: checkpointType};
          }),
        },
      },
      environments: {
        createMany: {
          skipDuplicates: true,
          data: Object.values(ProjectEnvironmentType).map(environmentType => {
            return {type: environmentType};
          }),
        },
      },
    });
  }

  @Get('projects')
  async getProjects(): Promise<Project[]> {
    return await this.projectService.findMany({});
  }

  @Get('projects/:projectId')
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

  @Patch('projects/:projectId')
  @ApiParam({
    name: 'projectId',
    schema: {type: 'string'},
    description: 'The uuid of the project.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  @ApiBody({
    description:
      "The 'projectName', 'clientName' and 'clientEmail' are required in request body.",
    examples: {
      a: {
        summary: '1. Update',
        value: {
          name: 'Galaxy',
          clientName: 'Henry Zhao',
          clientEmail: 'henry@inceptionpad.com',
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

  @Get('projects/:projectId/checkpoints')
  @ApiParam({
    name: 'projectId',
    schema: {type: 'string'},
    description: 'The uuid of the checkpoint.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getProjectCheckpoints(
    @Param('projectId') projectId: string
  ): Promise<ProjectCheckpoint[]> {
    return await this.checkpointService.findMany({
      where: {projectId: projectId},
    });
  }

  @Get('projects/:projectId/environments')
  @ApiParam({
    name: 'projectId',
    schema: {type: 'string'},
    description: 'The uuid of the environment.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getProjectEnvironments(
    @Param('projectId') projectId: string
  ): Promise<ProjectEnvironment[]> {
    return await this.environmentService.findMany({
      where: {projectId: projectId},
    });
  }
  /* End */
}
