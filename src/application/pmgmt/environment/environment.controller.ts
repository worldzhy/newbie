import {Controller, Delete, Get, Patch, Body, Param} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {ProjectEnvironmentService} from './environment.service';
import {
  Prisma,
  ProjectEnvironment,
  ProjectEnvironmentType,
} from '@prisma/client';

@ApiTags('[Application] Project Management / Project Environment')
@ApiBearerAuth()
@Controller('project-environments')
export class ProjectEnvironmentController {
  private environmentService = new ProjectEnvironmentService();

  @Get('types')
  listEnvironmentEnvironments() {
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
    schema: {type: 'number'},
    example: '1',
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
    schema: {type: 'number'},
    example: '1',
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
    schema: {type: 'number'},
    example: '1',
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
