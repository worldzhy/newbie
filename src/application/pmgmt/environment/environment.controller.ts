import {
  Controller,
  Delete,
  Get,
  Patch,
  Body,
  Param,
  Post,
  BadRequestException,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {ProjectEnvironmentService} from './environment.service';
import {Prisma, ProjectEnvironment} from '@prisma/client';

@ApiTags('[Application] Project Management / Project Environment')
@ApiBearerAuth()
@Controller('project-environments')
export class ProjectEnvironmentController {
  private environmentService = new ProjectEnvironmentService();

  @Post('')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'Development',
          projectId: '8ad800c8-31c0-44bb-989b-230c6adfad22',
        },
      },
    },
  })
  async createEnvironment(
    @Body()
    body: Prisma.ProjectEnvironmentUncheckedCreateInput
  ): Promise<ProjectEnvironment> {
    // [step 1] Guard statement.
    if (!body.name) {
      throw new BadRequestException(
        'Invalid project environment name in the request body.'
      );
    }

    // [step 2] Create project.
    return await this.environmentService.create({
      data: body,
    });
  }

  @Get(':environmentId')
  @ApiParam({
    name: 'environmentId',
    schema: {type: 'number'},
    example: '1',
  })
  async getEnvironment(
    @Param('environmentId') environmentId: string
  ): Promise<ProjectEnvironment> {
    return await this.environmentService.findUniqueOrThrow({
      where: {id: parseInt(environmentId)},
    });
  }

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

  //* Get cloudformation stacks
  @Get(':environmentId/infrastructure-stacks')
  @ApiParam({
    name: 'environmentId',
    schema: {type: 'number'},
    description: 'The id of the environment.',
    example: '1',
  })
  async getProjectCloudformationStacks(
    @Param('environmentId') environmentId: string
  ): Promise<ProjectEnvironment> {
    return await this.environmentService.findUniqueOrThrow({
      where: {id: parseInt(environmentId)},
      include: {infrastructureStacks: true},
    });
  }

  /* End */
}
