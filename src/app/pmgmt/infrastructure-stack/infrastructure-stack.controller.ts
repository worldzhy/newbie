import {Controller, Get, Post, Delete, Param, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {InfrastructureStackService} from './infrastructure-stack.service';
import {
  InfrastructureStackManager,
  InfrastructureStackState,
  InfrastructureStackType,
  ProjectEnvironmentType,
} from '@prisma/client';
import {CommonUtil} from 'src/_util/_common.util';

@ApiTags('App / Project Mgmt / Infrastructure')
@ApiBearerAuth()
@Controller()
export class InfrastructureStackController {
  private stackService = new InfrastructureStackService();

  @Get('infrastructure-stacks/types')
  async listStackTypes() {
    return Object.values(InfrastructureStackType);
  }

  /**
   * Get an infrastructure stack params with example values.
   *
   * @param {string} type
   * @returns
   * @memberof InfrastructureStackController
   */
  @Get('infrastructure-stacks/:type/:stackManager/params')
  @ApiParam({
    name: 'type',
    schema: {type: 'string'},
    example: InfrastructureStackType.P_AWS_S3,
  })
  @ApiParam({
    name: 'stackManager',
    schema: {type: 'string'},
    example: InfrastructureStackManager.PULUMI,
  })
  async getStackParams(
    @Param('type') type: InfrastructureStackType,
    @Param('stackManager') stackManager: InfrastructureStackManager
  ) {
    return this.stackService.getStackParams(stackManager, type);
  }

  /**
   * List stacks.
   *
   * @returns
   * @memberof InfrastructureStackController
   */
  @Post('infrastructure-stacks/list')
  @ApiBody({
    description: 'List infrastructure stacks.',
    examples: {
      a: {
        summary: '1. By projectId',
        value: {
          projectId: 'a9538079-2781-4e92-998b-293514d4a67b',
        },
      },
    },
  })
  async listStacks(@Body() body: {projectId: string}) {
    return await this.stackService.findMany({projectId: body.projectId});
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
   * @memberof InfrastructureStackController
   */
  @Post('infrastructure-stacks')
  @ApiBody({
    description: 'Create infrastructure stack.',
    examples: {
      a: {
        summary: '1. HIPAA network stack',
        value: {
          projectName: 'InceptionPad',
          environment: ProjectEnvironmentType.DEVELOPMENT,
          type: InfrastructureStackType.C_NETWORK_HIPAA,
          params: {
            SNSAlarmEmail: 'henry@inceptionpad.com',
          },
          manager: InfrastructureStackManager.CLOUDFORMATION,
        },
      },
      b: {
        summary: '2. Database stack',
        value: {
          projectName: 'Galaxy',
          environment: ProjectEnvironmentType.DEVELOPMENT,
          type: InfrastructureStackType.P_AWS_RDS,
          params: {
            instanceName: 'postgres-default',
            instanceClass: 'db.t3.micro',
          },
          manager: InfrastructureStackManager.PULUMI,
        },
      },
    },
  })
  async createStack(
    @Body()
    body: {
      projectName: string;
      environment: ProjectEnvironmentType;
      type: InfrastructureStackType;
      params?: object;
      manager: InfrastructureStackManager;
    }
  ) {
    const {projectName, environment, type, params, manager} = body;

    let stackName: string = type + '-' + CommonUtil.randomCode(8);
    let pulumiProjectName: string | undefined = undefined;

    // CloudFormation stack name must satisfy regular expression pattern: [a-zA-Z][-a-zA-Z0-9]*".
    // Pulumi stack must be under a Pulumi project.
    if (manager === InfrastructureStackManager.CLOUDFORMATION) {
      stackName = stackName.replace(/_/g, '-');
    } else if (manager === InfrastructureStackManager.PULUMI) {
      pulumiProjectName = projectName?.replace(/ /g, '_');
    }

    return await this.stackService.create({
      name: stackName,
      type: type,
      params: params,
      state: InfrastructureStackState.PREPARING,
      manager: manager,
      pulumiProjectName: pulumiProjectName,
      environment: environment,
      project: {connect: {name: projectName}},
    });
  }

  /**
   * Update a stack.
   *
   * @param {string} infrastructureStackId
   * @param {{
   *       params: object;
   *     }} body
   * @returns
   * @memberof InfrastructureStackController
   */
  @Post('infrastructure-stacks/:infrastructureStackId')
  @ApiParam({
    name: 'infrastructureStackId',
    schema: {type: 'string'},
    example: 'ff337f2d-d3a5-4f2e-be16-62c75477b605',
  })
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
    @Param('infrastructureStackId') infrastructureStackId: string,
    @Body()
    body: {
      params: object;
    }
  ) {
    const {params} = body;

    return await this.stackService.update(
      {id: infrastructureStackId},
      {
        params: params,
        state: InfrastructureStackState.PREPARING,
      }
    );
  }

  /**
   * Build infrastructure stack.
   *
   * @param {string} infrastructureStackId
   * @returns
   * @memberof InfrastructureStackController
   */
  @Post('infrastructure-stacks/:infrastructureStackId/build')
  @ApiParam({
    name: 'infrastructureStackId',
    schema: {type: 'string'},
    example: 'ff337f2d-d3a5-4f2e-be16-62c75477b605',
  })
  async buildStack(
    @Param('infrastructureStackId')
    infrastructureStackId: string
  ) {
    // [step 1] Get the infrastructure stack.
    const stack = await this.stackService.findOne({
      id: infrastructureStackId,
    });
    if (!stack) {
      return {
        data: null,
        err: {message: 'Invalid infrastructureStackId.'},
      };
    } else if (
      false ===
      this.stackService.checkStackParams(
        stack.manager,
        stack.type,
        stack.params
      )
    ) {
      return {
        data: null,
        err: {
          message: 'This infrastructure is not ready for building.',
        },
      };
    } else if (
      //stack.status === InfrastructureStackStatus.BUILDING ||
      stack.state === InfrastructureStackState.DESTROYING ||
      stack.state === InfrastructureStackState.DELETED
    ) {
      return {
        data: null,
        err: {
          message: 'Please check the infrastructure status.',
        },
      };
    }

    // [step 2] Destroy the infrastructure stack.
    return await this.stackService.build(infrastructureStackId);
  }

  @Get('infrastructure-stacks/:infrastructureStackId/describe')
  @ApiParam({
    name: 'infrastructureStackId',
    schema: {type: 'string'},
    example: 'ff337f2d-d3a5-4f2e-be16-62c75477b605',
  })
  async describeStack(
    @Param('infrastructureStackId')
    infrastructureStackId: string
  ) {
    // [step 1] Get the infrastructure stack.
    const stack = await this.stackService.findOne({
      id: infrastructureStackId,
    });
    if (!stack) {
      return {
        data: null,
        err: {message: 'Invalid infrastructureStackId.'},
      };
    }

    // [step 2] Describe the stack.
    return await this.stackService.describe(stack.name, stack.manager);
  }

  /**
   * Destroy infrastructure stack.
   *
   * @param {string} infrastructureStackId
   * @returns
   * @memberof InfrastructureStackController
   */
  @Delete('infrastructure-stacks/:infrastructureStackId/destroy')
  @ApiParam({
    name: 'infrastructureStackId',
    schema: {type: 'string'},
    example: 'ff337f2d-d3a5-4f2e-be16-62c75477b605',
  })
  async destroyStack(
    @Param('infrastructureStackId')
    infrastructureStackId: string
  ) {
    // [step 1] Get the infrastructure stack.
    const stack = await this.stackService.findOne({
      id: infrastructureStackId,
    });
    if (!stack) {
      return {
        data: null,
        err: {message: 'Invalid infrastructureStackId.'},
      };
    }
    if (stack.buildResult === null) {
      return {
        data: null,
        err: {
          message: 'The stack has not been built.',
        },
      };
    } else if (stack.state === InfrastructureStackState.DESTROY_SUCCEEDED) {
      return {
        data: null,
        err: {
          message: `The stack has been destroyed at ${stack.updatedAt}`,
        },
      };
    } else if (stack.state === InfrastructureStackState.DELETED) {
      return {
        data: null,
        err: {
          message: 'The stack has been deleted.',
        },
      };
    }

    // [step 2] Destroy the infrastructure stack.
    return await this.stackService.destroy(infrastructureStackId);
  }

  /**
   * Delete infrastructure stack.
   *
   * @param {string} infrastructureStackId
   * @returns
   * @memberof InfrastructureStackController
   */
  @Delete('infrastructure-stacks/:infrastructureStackId/delete')
  @ApiParam({
    name: 'infrastructureStackId',
    schema: {type: 'string'},
    example: 'ff337f2d-d3a5-4f2e-be16-62c75477b605',
  })
  async deleteStack(
    @Param('infrastructureStackId')
    infrastructureStackId: string
  ) {
    // [step 1] Get the infrastructure stack.
    const stack = await this.stackService.findOne({
      id: infrastructureStackId,
    });
    if (!stack) {
      return {
        data: null,
        err: {message: 'Invalid infrastructureStackId.'},
      };
    }
    if (stack.buildResult === null) {
      return {
        data: null,
        err: {
          message: 'The stack has not been built.',
        },
      };
    } else if (stack.state !== InfrastructureStackState.DESTROY_SUCCEEDED) {
      return {
        data: null,
        err: {
          message: 'The stack can not be deleted before destroying.',
        },
      };
    }

    // [step 2] Delete the infrastructure stack.
    return await this.stackService.delete(infrastructureStackId);
  }

  /**
   * Force delete a Pulumi stack.
   *
   * @param {string} infrastructureStackId
   * @returns
   * @memberof InfrastructureStackController
   */
  @Delete('infrastructure-stacks/:infrastructureStackId/delete-pulumi-force')
  @ApiParam({
    name: 'infrastructureStackId',
    schema: {type: 'string'},
    example: 'a143f94d-8698-4fc5-bd9c-45a3d965a08b',
  })
  async forceDeletePulumiStack(
    @Param('infrastructureStackId')
    infrastructureStackId: string
  ) {
    // [step 1] Get the infrastructure stack.
    const stack = await this.stackService.findOne({
      id: infrastructureStackId,
    });
    if (!stack) {
      return {
        data: null,
        err: {message: 'Invalid infrastructureStackId.'},
      };
    }

    // [step 2] Destroy the infrastructure stack.
    try {
      await this.stackService.destroy(infrastructureStackId);
    } catch (error) {
      // Do nothing
      console.log('Exception for destroying pulumi stack [', stack.name, ']');
    }

    // [step 3] Force delete the infrastructure stack.
    return await this.stackService.deletePulumiStackForce(
      infrastructureStackId
    );
  }

  /* End */
}
