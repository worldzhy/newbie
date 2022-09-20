import {Controller, Delete, Get, Patch, Body, Param} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {EnvironmentService} from './environment.service';
import {
  Prisma,
  ProjectEnvironment,
  ProjectEnvironmentType,
} from '@prisma/client';

@ApiTags('[Application] Project Management / Environment')
@ApiBearerAuth()
@Controller('project-management-environments')
export class EnvironmentController {
  private environmentService = new EnvironmentService();

  @Get('types')
  async listEnvironmentEnvironments() {
    return Object.values(ProjectEnvironmentType);
  }

  //* Get many
  @Get('')
  async getEnvironments(): Promise<ProjectEnvironment[]> {
    return await this.environmentService.findMany({});
  }

  //* Get
  @Get(':environmentId')
  @ApiParam({
    name: 'environmentId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  async getEnvironment(
    @Param('environmentId') environmentId: string
  ): Promise<ProjectEnvironment | null> {
    return await this.environmentService.findUnique({
      where: {id: parseInt(environmentId)},
    });
  }

  //* Update
  @Patch(':environmentId')
  @ApiParam({
    name: 'environmentId',
    schema: {type: 'string'},
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
    @Param('environmentId') environmentId: string,
    @Body() body: Prisma.ProjectEnvironmentUpdateInput
  ): Promise<ProjectEnvironment> {
    return await this.environmentService.update({
      where: {id: parseInt(environmentId)},
      data: body,
    });
  }

  //* Delete
  @Delete(':environmentId')
  @ApiParam({
    name: 'environmentId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  async deleteEnvironment(
    @Param('environmentId') environmentId: string
  ): Promise<ProjectEnvironment> {
    return await this.environmentService.delete({
      where: {id: parseInt(environmentId)},
    });
  }
  /* End */
}
