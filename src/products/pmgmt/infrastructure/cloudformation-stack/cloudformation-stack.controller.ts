import {Controller, Get, Post, Delete, Param, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {CloudFormationStackService} from './cloudformation-stack.service';
import {
  CloudFormationStackState,
  CloudFormationStackType,
  Prisma,
  ProjectEnvironmentType,
} from '@prisma/client';
import {randomCode} from '../../../../_util/_util';

@ApiTags('[Product] Project Management / Infrastructure / CloudFormation Stack')
@ApiBearerAuth()
@Controller('project-management')
export class CloudFormationStackController {
  private stackService = new CloudFormationStackService();

  @Get('cloudformation-stacks/types')
  async listStackTypes() {
    return Object.values(CloudFormationStackType);
  }

  /**
   * Get an cloudformation stack params with example values.
   *
   * @param {string} type
   * @returns
   * @memberof CloudFormationController
   */
  @Get('cloudformation-stacks/params/:type')
  @ApiParam({
    name: 'type',
    schema: {type: 'string'},
    example: CloudFormationStackType.CICD_BUILD,
  })
  async getStackParams(@Param('type') type: CloudFormationStackType) {
    return this.stackService.getStackParams(type);
  }

  /**
   * Get stacks.
   *
   * @returns
   * @memberof CloudFormationController
   */
  @Get('cloudformation-stacks')
  async getStacks() {
    return await this.stackService.findMany({});
  }

  /**
   * Create a stack.
   *
   * @param {{
   *       stackType: string;
   *       stackName: string;
   *       stackParams: object;
   *     }} body
   * @returns
   * @memberof CloudFormationController
   */
  @Post('cloudformation-stacks')
  @ApiBody({
    description: 'Create cloudformation stack.',
    examples: {
      a: {
        summary: '1. HIPAA network stack',
        value: {
          projectName: 'InceptionPad',
          environment: ProjectEnvironmentType.DEVELOPMENT,
          type: CloudFormationStackType.NETWORK_HIPAA,
          params: {
            SNSAlarmEmail: 'henry@inceptionpad.com',
          },
        },
      },
      b: {
        summary: '2. Data engine stack',
        value: {
          projectName: 'Galaxy',
          environment: ProjectEnvironmentType.DEVELOPMENT,
          type: CloudFormationStackType.PRODUCT_DATA_ENGINE,
          params: {
            instanceName: 'postgres-default',
            instanceClass: 'db.t3.micro',
          },
        },
      },
    },
  })
  async createStack(
    @Body()
    body: {
      projectName: string;
      environment: ProjectEnvironmentType;
      type: CloudFormationStackType;
      params?: object;
    }
  ) {
    const {projectName, environment, type, params} = body;

    // CloudFormation stack name must satisfy regular expression pattern: [a-zA-Z][-a-zA-Z0-9]*".
    const stackName = (type + '-' + randomCode(8)).replace(/_/g, '-');

    return await this.stackService.create({
      name: stackName,
      type: type,
      params: params,
      state: CloudFormationStackState.PREPARING,
      environment: environment,
      project: {connect: {name: projectName}},
    });
  }

  /**
   * Update a stack.
   *
   * @param {string} stackId
   * @param {Prisma.CloudFormationStackUpdateInput} body
   * @returns
   * @memberof CloudFormationController
   */
  @Post('cloudformation-stacks/:stackId')
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

  /**
   * Build cloudformation stack.
   *
   * @param {string} stackId
   * @returns
   * @memberof CloudFormationController
   */
  @Post('cloudformation-stacks/:stackId/build')
  @ApiParam({
    name: 'stackId',
    schema: {type: 'string'},
    example: 'ff337f2d-d3a5-4f2e-be16-62c75477b605',
  })
  async buildStack(
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
    } else if (
      //stack.status === CloudFormationStatus.BUILDING ||
      stack.state === CloudFormationStackState.DESTROYING ||
      stack.state === CloudFormationStackState.DELETED
    ) {
      return {
        data: null,
        err: {
          message: 'Please check the cloudformation status.',
        },
      };
    }

    // [step 2] Build the cloudformation stack.
    return await this.stackService.build(stack.name, stack.type, stack.params);
  }

  @Get('cloudformation-stacks/:stackId/describe')
  @ApiParam({
    name: 'stackId',
    schema: {type: 'string'},
    example: 'ff337f2d-d3a5-4f2e-be16-62c75477b605',
  })
  async describeStack(
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

    // [step 2] Describe the stack.
    return await this.stackService.describe(stack.name);
  }

  /**
   * Destroy cloudformation stack.
   *
   * @param {string} stackId
   * @returns
   * @memberof CloudFormationController
   */
  @Delete('cloudformation-stacks/:stackId/destroy')
  @ApiParam({
    name: 'stackId',
    schema: {type: 'string'},
    example: 'ff337f2d-d3a5-4f2e-be16-62c75477b605',
  })
  async destroyStack(
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
    if (stack.buildResult === null) {
      return {
        data: null,
        err: {
          message: 'The stack has not been built.',
        },
      };
    } else if (stack.state === CloudFormationStackState.DESTROY_SUCCEEDED) {
      return {
        data: null,
        err: {
          message: `The stack has been destroyed at ${stack.updatedAt}`,
        },
      };
    } else if (stack.state === CloudFormationStackState.DELETED) {
      return {
        data: null,
        err: {
          message: 'The stack has been deleted.',
        },
      };
    }

    // [step 2] Destroy the cloudformation stack.
    return await this.stackService.destroy(stackId);
  }

  /**
   * Delete cloudformation stack.
   *
   * @param {string} stackId
   * @returns
   * @memberof CloudFormationController
   */
  @Delete('cloudformation-stacks/:stackId/delete')
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
      return {
        data: null,
        err: {message: 'Invalid stackId.'},
      };
    }
    if (
      stack.buildResult !== null &&
      stack.state !== CloudFormationStackState.DESTROY_SUCCEEDED
    ) {
      return {
        data: null,
        err: {
          message: 'The stack can not be deleted before destroying.',
        },
      };
    }

    // [step 2] Delete the cloudformation stack.
    return await this.stackService.delete({where: {id: stackId}});
  }

  /* End */
}
