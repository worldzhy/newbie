import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  BadRequestException,
  NotFoundException,
  Query,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {
  InfrastructureStack,
  InfrastructureStackManager,
  InfrastructureStackState,
  Prisma,
} from '@prisma/client';
import {ProjectInfrastructureStackService} from '@microservices/project-mgmt/infrastructure/infrastructure-stack.service';
import {
  CloudFormationStackService,
  CloudFormationStackType,
} from '@microservices/project-mgmt/infrastructure/cloudformation/cloudformation.service';
import {
  PulumiStackService,
  PulumiStackType,
} from '@microservices/project-mgmt/infrastructure/pulumi/pulumi.service';
import {DestroyResult, UpResult} from '@pulumi/pulumi/automation';
import {
  CreateStackCommandOutput,
  DeleteStackCommandOutput,
} from '@aws-sdk/client-cloudformation';

@ApiTags('Project Management / Infrastructure Stack')
@ApiBearerAuth()
@Controller('project-infrastructure-stacks')
export class ProjectInfrastructureStackController {
  constructor(
    private readonly infrastructureStackService: ProjectInfrastructureStackService,
    private readonly cloudformationStackService: CloudFormationStackService,
    private readonly pulumiStackService: PulumiStackService
  ) {}

  @Get('managers')
  listStackManagers() {
    return Object.values(InfrastructureStackManager);
  }

  @Get('types')
  listStackTypes(@Query() manager: string) {
    if (manager === InfrastructureStackManager.CloudFormation) {
      return Object.values(CloudFormationStackType);
    } else if (manager === InfrastructureStackManager.Pulumi) {
      return Object.values(PulumiStackType);
    } else {
      throw new BadRequestException('The infrastructure manager is invalid.');
    }
  }

  @Get('params')
  async getStackParams(@Query() type: string, @Query() manager: string) {
    if (manager === InfrastructureStackManager.CloudFormation) {
      return this.cloudformationStackService.getStackParams(type);
    } else if (manager === InfrastructureStackManager.Pulumi) {
      return this.pulumiStackService.getStackParams(type);
    } else {
      throw new BadRequestException('The infrastructure manager is invalid.');
    }
  }

  @Post('')
  @ApiBody({
    description: 'Create infrastructure stack.',
    examples: {
      a: {
        summary: '1. HIPAA network stack',
        value: {
          manager: InfrastructureStackManager.CloudFormation,
          type: CloudFormationStackType.NETWORK_HIPAA,
          params: {
            SNSAlarmEmail: 'henry@inceptionpad.com',
          },
          environmentId: '1',
        },
      },
      b: {
        summary: '2. Data engine stack',
        value: {
          manager: InfrastructureStackManager.Pulumi,
          type: PulumiStackType.AWS_RDS,
          params: {
            instanceName: 'postgres-default',
            instanceClass: 'db.t3.micro',
          },
          environmentId: '1',
        },
      },
    },
  })
  async createStack(
    @Body()
    body: Prisma.InfrastructureStackUncheckedCreateInput
  ): Promise<InfrastructureStack> {
    return await this.infrastructureStackService.create({data: body});
  }

  @Get(':stackId')
  async getStack(
    @Param('stackId') stackId: string
  ): Promise<InfrastructureStack> {
    return await this.infrastructureStackService.findUniqueOrThrow({
      where: {id: stackId},
    });
  }

  @Patch(':stackId')
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
    return await this.infrastructureStackService.update({
      where: {id: stackId},
      data: body,
    });
  }

  @Delete(':stackId')
  async deleteStack(
    @Param('stackId')
    stackId: string
  ): Promise<InfrastructureStack> {
    // [step 1] Get the infrastructure stack.
    const stack = await this.infrastructureStackService.findUniqueOrThrow({
      where: {id: stackId},
    });

    if (
      !(
        stack.state in
        [
          InfrastructureStackState.PENDING,
          InfrastructureStackState.DESTROY_SUCCEEDED,
        ]
      )
    ) {
      throw new BadRequestException(
        'The stack record can not be deleted because the infrastructure resource is still there.'
      );
    }

    // [step 2] Delete the stack record on database.
    return await this.infrastructureStackService.delete({where: {id: stackId}});
  }

  //* Create resources
  @Post(':stackId/create-resources')
  async createResources(
    @Param('stackId')
    stackId: string
  ): Promise<InfrastructureStack> {
    // [step 1] Get the infrastructure stack.
    const stack = await this.infrastructureStackService.findUniqueOrThrow({
      where: {id: stackId},
      include: {environment: true},
    });

    if (
      !(
        stack.state in
        [
          InfrastructureStackState.PENDING,
          InfrastructureStackState.DESTROY_SUCCEEDED,
        ]
      )
    ) {
      throw new BadRequestException('The infrastructure has been built.');
    }

    // [step 2] Build the infrastructure stack.
    let output: CreateStackCommandOutput | UpResult;
    let state: InfrastructureStackState;
    if (stack.manager === InfrastructureStackManager.CloudFormation) {
      if (
        false ===
        this.cloudformationStackService.checkStackParams({
          stackType: stack.type,
          stackParams: stack.params as object,
        })
      ) {
        throw new BadRequestException(
          'This infrastructure stack parameters are not ready.'
        );
      }

      output = await this.cloudformationStackService.createResources(stack);
      state = InfrastructureStackState.BUILD_PROCESSING;
    } else if (stack.manager === InfrastructureStackManager.Pulumi) {
      if (
        false ===
        this.pulumiStackService.checkStackParams({
          stackType: stack.type,
          stackParams: stack.params as object,
        })
      ) {
        throw new BadRequestException(
          'This infrastructure stack parameters are not ready.'
        );
      }

      output = await this.pulumiStackService.createResources(stack);
      // pulumiStackResult.summary.result is one of ['failed', 'in-progress', 'not-started', 'succeeded']
      if (output.summary.result === 'succeeded') {
        state = InfrastructureStackState.BUILD_SUCCEEDED;
      } else if (output.summary.result === 'in-progress') {
        state = InfrastructureStackState.BUILD_PROCESSING;
      } else if (output.summary.result === 'failed') {
        state = InfrastructureStackState.BUILD_FAILED;
      } else {
        state = InfrastructureStackState.PENDING;
      }
    } else {
      throw new BadRequestException('The infrastructure manager is invalid.');
    }

    return await this.infrastructureStackService.update({
      where: {id: stack.id},
      data: {
        state: state,
        createStackOutput: output as object,
      },
    });
  }

  //* Destroy resources
  @Post(':stackId/destroy-resources')
  async destroyResources(
    @Param('stackId')
    stackId: string
  ): Promise<InfrastructureStack> {
    // [step 1] Get the infrastructure stack.
    const stack = await this.infrastructureStackService.findUniqueOrThrow({
      where: {id: stackId},
      include: {environment: true},
    });

    if (
      stack.state in
      [
        InfrastructureStackState.PENDING,
        InfrastructureStackState.BUILD_PROCESSING,
        InfrastructureStackState.DESTROY_PROCESSING,
        InfrastructureStackState.DESTROY_SUCCEEDED,
      ]
    ) {
      throw new BadRequestException(
        'The stack has not been built or is processing.'
      );
    }

    // [step 2] Delete the stack on AWS CloudFormation.
    let output: DeleteStackCommandOutput | DestroyResult;
    let state: InfrastructureStackState;
    if (stack.manager === InfrastructureStackManager.CloudFormation) {
      output = await this.cloudformationStackService.destroyResources(stack);
      state = InfrastructureStackState.DESTROY_PROCESSING;
    } else if (stack.manager === InfrastructureStackManager.Pulumi) {
      output = await this.pulumiStackService.destroyResources(stack);
      if (output.summary.result === 'succeeded') {
        state = InfrastructureStackState.DESTROY_SUCCEEDED;
      } else if (output.summary.result === 'in-progress') {
        state = InfrastructureStackState.DESTROY_PROCESSING;
      } else if (output.summary.result === 'failed') {
        state = InfrastructureStackState.DESTROY_FAILED;
      } else {
        state = InfrastructureStackState.PENDING;
      }
    } else {
      throw new BadRequestException('The infrastructure manager is invalid.');
    }

    return await this.infrastructureStackService.update({
      where: {id: stack.id},
      data: {
        state: state,
        deleteStackOutput: output as object,
      },
    });
  }

  //* Force remove a stack from Pulumi.
  @Post('force-delete-pulumi-stack')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: 'Force delete',
        value: {
          params: {
            pulumiOrganization: 'worldzhy',
            pulumiProject: 'InceptionPad',
            pulumiStack: 'P_AWS_RDS-35137057',
          },
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
    return await this.pulumiStackService.forceDeleteOnPulumi(body);
  }

  /* End */
}
