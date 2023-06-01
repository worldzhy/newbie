import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  BadRequestException,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {ProjectService} from './project.service';
import {CheckpointService} from '../checkpoint/checkpoint.service';
import {EnvironmentService} from '../environment/environment.service';
import {verifyProjectName} from '../../../toolkit/validators/project.validator';

import {
  Prisma,
  Project,
  ProjectCheckpointType,
  ProjectEnvironmentType,
  ProjectState,
} from '@prisma/client';

@ApiTags('[Application] Project Management / Project')
@ApiBearerAuth()
@Controller('project-management-projects')
export class ProjectController {
  private projectService = new ProjectService();
  private checkpointService = new CheckpointService();
  private environmentService = new EnvironmentService();

  //* Create
  @Post('')
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
      },
    });
  }

  //* Get many
  @Get('')
  async getProjects(): Promise<Project[]> {
    return await this.projectService.findMany({});
  }

  //* Get
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

  //* Update
  @Patch(':projectId')
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

  //* Delete
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

  //* Get cloudformation stacks
  @Get(':projectId/cloudformation-stacks')
  @ApiParam({
    name: 'projectId',
    schema: {type: 'string'},
    description: 'The uuid of the project.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getProjectCloudformationStacks(
    @Param('projectId') projectId: string
  ): Promise<Project> {
    return await this.projectService.findUniqueOrThrow({
      where: {id: projectId},
      include: {cloudformationStacks: true},
    });
  }

  //* Get pulumi stacks
  @Get(':projectId/pulumi-stacks')
  @ApiParam({
    name: 'projectId',
    schema: {type: 'string'},
    description: 'The uuid of the project.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getProjectPulumiStacks(
    @Param('projectId') projectId: string
  ): Promise<Project> {
    return await this.projectService.findUniqueOrThrow({
      where: {id: projectId},
      include: {pulumiStacks: true},
    });
  }

  /* End */
}
