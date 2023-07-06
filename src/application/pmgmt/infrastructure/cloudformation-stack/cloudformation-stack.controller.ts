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
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {CloudFormationStackService} from './cloudformation-stack.service';
import {
  CloudFormationStack,
  CloudFormationStackState,
  CloudFormationStackType,
  Prisma,
} from '@prisma/client';

@ApiTags(
  '[Application] Project Management / Infrastructure / CloudFormation Stack'
)
@ApiBearerAuth()
@Controller('project-cloudformation-stacks')
export class CloudFormationStackController {
  private stackService = new CloudFormationStackService();

  @Get('types')
  listStackTypes(): (
    | 'COMPUTING_FARGATE'
    | 'NETWORK_HIPAA'
    | 'CICD_BUILD'
    | 'CICD_PIPELINE'
    | 'CICD_REPOSITORY'
    | 'PRODUCT_DATA_ENGINE'
    | 'PRODUCT_MESSAGE_TRACKER'
  )[] {
    return Object.values(CloudFormationStackType);
  }

  @Get(':type/params')
  @ApiParam({
    name: 'type',
    schema: {type: 'string'},
    example: CloudFormationStackType.CICD_BUILD,
  })
  async getStackParams(
    @Param('type') type: CloudFormationStackType
  ): Promise<{}> {
    return this.stackService.getStackParams(type);
  }

  //* Create
  @Post('')
  @ApiBody({
    description: 'Create cloudformation stack.',
    examples: {
      a: {
        summary: '1. HIPAA network stack',
        value: {
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
          type: CloudFormationStackType.PRODUCT_DATA_ENGINE,
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
    body: Prisma.CloudFormationStackUncheckedCreateInput
  ): Promise<CloudFormationStack> {
    return await this.stackService.create({data: body});
  }

  //* Get many
  @Get('')
  async getStacks(): Promise<CloudFormationStack[]> {
    return await this.stackService.findMany({});
  }

  //* Get
  @Get(':stackId')
  @ApiParam({
    name: 'stackId',
    schema: {type: 'string'},
    example: 'ff337f2d-d3a5-4f2e-be16-62c75477b605',
  })
  async getStack(
    @Param('stackId') stackId: string
  ): Promise<CloudFormationStack | null> {
    return await this.stackService.findUnique({where: {id: stackId}});
  }

  //* Update
  @Patch(':stackId')
  @ApiParam({
    name: 'stackId',
    schema: {type: 'string'},
    example: 'ff337f2d-d3a5-4f2e-be16-62c75477b605',
  })
  @ApiBody({
    description: 'Update cloudformation stack.',
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
    body: Prisma.CloudFormationStackUpdateInput
  ): Promise<CloudFormationStack> {
    return await this.stackService.update({
      where: {id: stackId},
      data: body,
    });
  }

  //* Delete
  @Delete(':stackId')
  @ApiParam({
    name: 'stackId',
    schema: {type: 'string'},
    example: 'ff337f2d-d3a5-4f2e-be16-62c75477b605',
  })
  async deleteStack(
    @Param('stackId')
    stackId: string
  ): Promise<CloudFormationStack> {
    // [step 1] Get the cloudformation stack.
    const stack = await this.stackService.findUnique({
      where: {id: stackId},
    });
    if (!stack) {
      throw new NotFoundException('Not found the stack.');
    }
    if (stack.state === CloudFormationStackState.BUILD) {
      throw new BadRequestException(
        'The stack record can not be deleted before destroying.'
      );
    }

    // [step 2] Delete the stack record on database.
    return await this.stackService.delete({where: {id: stackId}});
  }

  //* Create resources
  @Post(':stackId/create-resources')
  @ApiParam({
    name: 'stackId',
    schema: {type: 'string'},
    example: 'ff337f2d-d3a5-4f2e-be16-62c75477b605',
  })
  async createResources(
    @Param('stackId')
    stackId: string
  ): Promise<CloudFormationStack> {
    // [step 1] Get the cloudformation stack.
    const stack = await this.stackService.findUnique({
      where: {id: stackId},
    });
    if (!stack) {
      throw new NotFoundException('Not found the stack.');
    } else if (
      false ===
      this.stackService.checkStackParams(stack.type, stack.params as object)
    ) {
      throw new BadRequestException(
        'This cloudformation is not ready for building.'
      );
    } else if (stack.state === CloudFormationStackState.BUILD) {
      throw new BadRequestException('The cloudformation has been built.');
    }

    // [step 2] Build the cloudformation stack.
    return await this.stackService.createResources(stack);
  }

  //* Destroy resources
  @Post(':stackId/destroy-resources')
  @ApiParam({
    name: 'stackId',
    schema: {type: 'string'},
    example: 'ff337f2d-d3a5-4f2e-be16-62c75477b605',
  })
  async destroyResources(
    @Param('stackId')
    stackId: string
  ): Promise<CloudFormationStack> {
    // [step 1] Get the cloudformation stack.
    const stack = await this.stackService.findUnique({
      where: {id: stackId},
    });
    if (!stack) {
      throw new NotFoundException('Not found the stack.');
    }
    if (stack.createStackOutput === null) {
      throw new BadRequestException('The stack has not been built.');
    } else if (stack.state === CloudFormationStackState.DESTROYED) {
      throw new BadRequestException(
        `The stack has been destroyed at ${stack.updatedAt}`
      );
    }

    // [step 2] Delete the stack on AWS CloudFormation.
    return await this.stackService.destroyResources(stack);
  }

  /* End */
}
