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
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {Prisma, AwsEnvironment} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {AwsEnvironmentService} from '@microservices/cloud/iaas/aws/environment/environment.service';

@ApiTags('Aws Environment')
@ApiBearerAuth()
@Controller('aws-environments')
export class AwsEnvironmentController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly awsEnvironmentService: AwsEnvironmentService
  ) {}

  @Post('')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'Aircruiser Prod',
          awsAccessKeyId: '',
          awsSecretAccessKey: '',
          awsRegion: '',
        },
      },
    },
  })
  async createEnvironment(
    @Body()
    body: Prisma.AwsEnvironmentUncheckedCreateInput
  ): Promise<AwsEnvironment> {
    // [step 1] Guard statement.
    if (!body.name) {
      throw new BadRequestException(
        'Invalid project environment name in the request body.'
      );
    }

    // [step 2] Create project.
    return await this.awsEnvironmentService.create({data: body});
  }

  @Get(':environmentId')
  async getEnvironment(
    @Param('environmentId') environmentId: string
  ): Promise<AwsEnvironment> {
    return await this.prisma.awsEnvironment.findUniqueOrThrow({
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
    },
  })
  async updateEnvironment(
    @Param('environmentId') environmentId: string,
    @Body() body: Prisma.AwsEnvironmentUpdateInput
  ): Promise<AwsEnvironment> {
    return await this.awsEnvironmentService.update({
      where: {id: environmentId},
      data: body,
    });
  }

  @Delete(':environmentId')
  async deleteEnvironment(
    @Param('environmentId') environmentId: string
  ): Promise<AwsEnvironment> {
    return await this.prisma.awsEnvironment.delete({
      where: {id: environmentId},
    });
  }

  /* End */
}
