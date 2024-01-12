import {
  Controller,
  Delete,
  Get,
  Patch,
  Body,
  Param,
  Post,
  BadRequestException,
  Query,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {Prisma, ProjectEnvironment} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@ApiTags('Project Environment')
@ApiBearerAuth()
@Controller('project-environments')
export class ProjectEnvironmentController {
  constructor(private readonly prisma: PrismaService) {}

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
    return await this.prisma.projectEnvironment.create({
      data: body,
    });
  }

  @Get('')
  async getEnvironments(@Query('projectId') projectId: string) {
    return await this.prisma.findManyInOnePage({
      model: Prisma.ModelName.ProjectEnvironment,
      findManyArgs: {where: {projectId}},
    });
  }

  @Get(':environmentId')
  async getEnvironment(
    @Param('environmentId') environmentId: number
  ): Promise<ProjectEnvironment> {
    return await this.prisma.projectEnvironment.findUniqueOrThrow({
      where: {id: environmentId},
    });
  }

  @Patch(':environmentId')
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
  ): Promise<ProjectEnvironment> {
    return await this.prisma.projectEnvironment.update({
      where: {id: environmentId},
      data: body,
    });
  }

  @Delete(':environmentId')
  async deleteEnvironment(
    @Param('environmentId') environmentId: number
  ): Promise<ProjectEnvironment> {
    return await this.prisma.projectEnvironment.delete({
      where: {id: environmentId},
    });
  }

  /* End */
}
