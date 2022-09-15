import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Patch,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {CloudFormationStackService} from './cloudformation-stack.service';
import {
  CloudFormationStackState,
  CloudFormationStackType,
  Prisma,
  ProjectEnvironmentType,
} from '@prisma/client';

@ApiTags(
  '[Application] Project Management / Infrastructure / CloudFormation Stack'
)
@ApiBearerAuth()
@Controller('project-management')
export class CloudFormationStackController {
  private stackService = new CloudFormationStackService();

  @Get('cloudformation-stacks/types')
  async listStackTypes() {
    return Object.values(CloudFormationStackType);
  }

  @Get('cloudformation-stacks/params/:type')
  @ApiParam({
    name: 'type',
    schema: {type: 'string'},
    example: CloudFormationStackType.CICD_BUILD,
  })
  async getStackParams(@Param('type') type: CloudFormationStackType) {
    return this.stackService.getStackParams(type);
  }

  @Post('cloudformation-stacks')
  @ApiBody({
    description: 'Create cloudformation stack.',
    examples: {
      a: {
        summary: '1. HIPAA network stack',
        value: {
          projectId: '5a91888b-0b60-49ac-9a32-493f21bd5545',
          type: CloudFormationStackType.NETWORK_HIPAA,
          params: {
            SNSAlarmEmail: 'henry@inceptionpad.com',
          },
          environment: ProjectEnvironmentType.DEVELOPMENT,
        },
      },
      b: {
        summary: '2. Data engine stack',
        value: {
          projectId: '5a91888b-0b60-49ac-9a32-493f21bd5545',
          type: CloudFormationStackType.PRODUCT_DATA_ENGINE,
          params: {
            instanceName: 'postgres-default',
            instanceClass: 'db.t3.micro',
          },
          environment: ProjectEnvironmentType.DEVELOPMENT,
        },
      },
    },
  })
  async createStack(
    @Body()
    body: Prisma.CloudFormationStackUncheckedCreateInput
  ) {
    return await this.stackService.create({data: body});
  }

  @Get('cloudformation-stacks')
  async getStacks() {
    return await this.stackService.findMany({});
  }

  @Get('cloudformation-stacks/:stackId')
  @ApiParam({
    name: 'stackId',
    schema: {type: 'string'},
    example: 'ff337f2d-d3a5-4f2e-be16-62c75477b605',
  })
  async getStack(@Param('stackId') stackId: string) {
    return await this.stackService.findUnique({where: {id: stackId}});
  }

  @Patch('cloudformation-stacks/:stackId')
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
  ) {
    return await this.stackService.update({
      where: {id: stackId},
      data: body,
    });
  }

  @Delete('cloudformation-stacks/:stackId')
  @ApiParam({
    name: 'stackId',
    schema: {type: 'string'},
    example: 'ff337f2d-d3a5-4f2e-be16-62c75477b605',
  })
  async deleteStack(
    @Param('stackId')
    stackId: string
  ) {
    // [step 1] Get the cloudformation stack.
    const stack = await this.stackService.findUnique({
      where: {id: stackId},
    });
    if (!stack) {
      return {err: {message: 'Invalid stackId.'}};
    }
    if (stack.state === CloudFormationStackState.BUILD) {
      return {
        err: {
          message: 'The stack record can not be deleted before destroying.',
        },
      };
    }

    // [step 2] Delete the stack record on database.
    return await this.stackService.delete({where: {id: stackId}});
  }

  /**
   * Build cloudformation stack.
   *
   * @param {string} stackId
   * @returns
   * @memberof CloudFormationStackController
   */
  @Post('cloudformation-stacks/:stackId/create-resources')
  @ApiParam({
    name: 'stackId',
    schema: {type: 'string'},
    example: 'ff337f2d-d3a5-4f2e-be16-62c75477b605',
  })
  async createResources(
    @Param('stackId')
    stackId: string
  ) {
    // [step 1] Get the cloudformation stack.
    const stack = await this.stackService.findUnique({
      where: {id: stackId},
    });
    if (!stack) {
      return {
        data: null,
        err: {message: 'Invalid stackId.'},
      };
    } else if (
      false ===
      this.stackService.checkStackParams(stack.type, stack.params as object)
    ) {
      return {
        data: null,
        err: {
          message: 'This cloudformation is not ready for building.',
        },
      };
    } else if (stack.state === CloudFormationStackState.BUILD) {
      return {
        data: null,
        err: {
          message: 'The cloudformation has been built.',
        },
      };
    }

    // [step 2] Build the cloudformation stack.
    return await this.stackService.createResources(stack);
  }

  /**
   * Destroy stack resources.
   *
   * @param {string} stackId
   * @returns
   * @memberof CloudFormationStackController
   */
  @Post('cloudformation-stacks/:stackId/destroy-resources')
  @ApiParam({
    name: 'stackId',
    schema: {type: 'string'},
    example: 'ff337f2d-d3a5-4f2e-be16-62c75477b605',
  })
  async destroyResources(
    @Param('stackId')
    stackId: string
  ) {
    // [step 1] Get the cloudformation stack.
    const stack = await this.stackService.findUnique({
      where: {id: stackId},
    });
    if (!stack) {
      return {
        data: null,
        err: {message: 'Invalid stackId.'},
      };
    }
    if (stack.createStackOutput === null) {
      return {
        data: null,
        err: {
          message: 'The stack has not been built.',
        },
      };
    } else if (stack.state === CloudFormationStackState.DESTROYED) {
      return {
        data: null,
        err: {
          message: `The stack has been destroyed at ${stack.updatedAt}`,
        },
      };
    }

    // [step 2] Delete the stack on AWS CloudFormation.
    return await this.stackService.destroyResources(stack);
  }

  /* End */
}
