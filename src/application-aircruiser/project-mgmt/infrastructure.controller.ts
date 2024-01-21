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
import {
  InfrastructureStack,
  InfrastructureStackManager,
  InfrastructureStackState,
  Prisma,
} from '@prisma/client';
import {CloudFormationStackType} from '@microservices/project-mgmt/infrastructure/cloudformation/cloudformation.service';
import {PulumiStackType} from '@microservices/project-mgmt/infrastructure/pulumi/pulumi.service';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {InfrastructureService} from '@microservices/project-mgmt/infrastructure/infrastructure.service';

@ApiTags('Infrastructure')
@ApiBearerAuth()
@Controller('infrastructure')
export class ProjectInfrastructureController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly infrastructureService: InfrastructureService
  ) {}

  @Get('managers')
  listStackManagers() {
    return this.infrastructureService.listManagers();
  }

  @Get('stacks/types')
  listStackTypes(@Query('manager') manager: string) {
    return this.infrastructureService.listStackTypes(manager);
  }

  @Get('stacks/params')
  async getStackParams(
    @Query('type') type: string,
    @Query('manager') manager: string
  ) {
    return this.infrastructureService.getStackParams({manager, type});
  }

  @Post('stacks')
  @ApiBody({
    description: 'Create infrastructure stack.',
    examples: {
      a: {
        summary: '1. CloudFormation stack',
        value: {
          manager: InfrastructureStackManager.CloudFormation,
          type: CloudFormationStackType.MESSAGE_TRACKER,
          params: {
            DatabaseHost:
              'solidcore-dev.ccjlptnm8vot.us-east-1.rds.amazonaws.com',
            DatabasePort: '5432',
            DatabaseMasterUsername: 'postgres',
            DatabaseMasterUserPassword: 'postgres',
            DatabaseName: 'postgres',
            SESIdentityARN:
              'arn:aws:ses:us-east-1:196438055748:identity/info@solidcore.co',
            FromAddress: 'info@solidcore.co',
          },
          environmentId: 1,
        },
      },
      b: {
        summary: '2. Pulumi stack',
        value: {
          manager: InfrastructureStackManager.Pulumi,
          type: PulumiStackType.AWS_S3,
          params: {
            bucketName: 'example-bucket',
            isPublic: false,
          },
          environmentId: 1,
        },
      },
    },
  })
  async createStack(
    @Body()
    body: Prisma.InfrastructureStackUncheckedCreateInput
  ): Promise<InfrastructureStack> {
    return await this.prisma.infrastructureStack.create({data: body});
  }

  @Get('stacks')
  async getStacks(@Query('environmentId') environmentId: number) {
    return await this.prisma.findManyInOnePage({
      model: Prisma.ModelName.InfrastructureStack,
      findManyArgs: {where: {environmentId}},
    });
  }

  @Get('stacks/:stackId')
  async getStack(
    @Param('stackId') stackId: string
  ): Promise<InfrastructureStack> {
    return await this.prisma.infrastructureStack.findUniqueOrThrow({
      where: {id: stackId},
    });
  }

  @Patch('stacks/:stackId')
  @ApiBody({
    description: 'Update infrastructure stack.',
    examples: {
      a: {
        summary: '1. AWS VPC stack',
        value: {
          params: {
            vpcName: 'pulumi-test-vpc-modified',
            vpcCidrBlock: '10.21.0.0/16',
          },
        },
      },
      b: {
        summary: '2. Database stack',
        value: {
          params: {
            instanceName: 'postgres-default-modified',
            instanceClass: 'db.t3.small',
          },
        },
      },
    },
  })
  async updateStack(
    @Param('stackId') stackId: string,
    @Body()
    body: Prisma.InfrastructureStackUpdateInput
  ): Promise<InfrastructureStack> {
    return await this.prisma.infrastructureStack.update({
      where: {id: stackId},
      data: body,
    });
  }

  @Delete('stacks/:stackId')
  async deleteStack(
    @Param('stackId')
    stackId: string
  ): Promise<InfrastructureStack> {
    // [step 1] Get the infrastructure stack.
    const stack = await this.prisma.infrastructureStack.findUniqueOrThrow({
      where: {id: stackId},
    });

    if (
      stack.state !== InfrastructureStackState.PENDING &&
      stack.state !== InfrastructureStackState.DESTROY_SUCCEEDED
    ) {
      throw new BadRequestException(
        'The stack record can not be deleted because the infrastructure resource is still there.'
      );
    }

    // [step 2] Delete the stack record on database.
    return await this.prisma.infrastructureStack.delete({where: {id: stackId}});
  }

  //* Create resources
  @Post('stacks/:stackId/create-resources')
  async createResources(
    @Param('stackId')
    stackId: string
  ): Promise<InfrastructureStack> {
    return await this.infrastructureService.createStack(stackId);
  }

  //* Destroy resources
  @Post('stacks/:stackId/destroy-resources')
  async destroyResources(
    @Param('stackId')
    stackId: string
  ): Promise<InfrastructureStack> {
    return await this.infrastructureService.destroyStack(stackId);
  }

  //* Force remove a stack from Pulumi.
  @Post('force-delete-pulumi-stack')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: 'Force delete',
        value: {
          pulumiOrganization: 'worldzhy',
          pulumiProject: 'InceptionPad',
          pulumiStack: 'P_AWS_RDS-35137057',
        },
      },
    },
  })
  async forceDeleteOnPulumi(
    @Body()
    body: {
      pulumiOrganization: string;
      pulumiProject: string;
      pulumiStack: string;
    }
  ) {
    return await this.infrastructureService.forceDeleteOnPulumi(body);
  }

  /* End */
}
