import {Controller, Get, Param, Body, Patch} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {EnvironmentService} from './environment.service';
import {
  Prisma,
  ProjectEnvironment,
  ProjectEnvironmentType,
} from '@prisma/client';

@ApiTags('[Product] Project Management / Environment')
@ApiBearerAuth()
@Controller('project-management')
export class EnvironmentController {
  private environmentService = new EnvironmentService();

  @Get('/environments/types')
  async listEnvironmentEnvironments() {
    return Object.values(ProjectEnvironmentType);
  }

  /**
   * Get environments
   *
   * @param {string} projectId
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof EnvironmentController
   */
  @Get('/environments/projects/:projectId')
  @ApiParam({
    name: 'projectId',
    schema: {type: 'string'},
    description: 'The uuid of the environment.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getEnvironments(
    @Param('projectId') projectId: string
  ): Promise<ProjectEnvironment[]> {
    return await this.environmentService.findMany({
      where: {projectId: projectId},
    });
  }

  /**
   * Update environment
   *
   * @param {number} environmentId
   * @param {Prisma.ProjectEnvironmentUpdateInput} body
   * @returns
   * @memberof EnvironmentController
   */
  @Patch('environments/:environmentId')
  @ApiParam({
    name: 'environmentId',
    schema: {type: 'number'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
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
  async updateEnvironment(
    @Param('environmentId') environmentId: number,
    @Body() body: Prisma.ProjectEnvironmentUpdateInput
  ) {
    // [step 1] Guard statement.

    // [step 2] Update environment.
    const result = await this.environmentService.update({
      where: {id: environmentId},
      data: body,
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Environment updated failed.'},
      };
    }
  }

  /* End */
}
