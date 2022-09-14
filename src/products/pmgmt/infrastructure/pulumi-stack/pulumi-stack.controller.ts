import {Controller, Get, Post, Delete, Param, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {PulumiStackService} from './pulumi-stack.service';
import {
  PulumiStackState,
  PulumiStackType,
  ProjectEnvironmentType,
  Prisma,
} from '@prisma/client';
import {randomCode} from '../../../../_util/_util';

@ApiTags('[Product] Project Management / Infrastructure / Pulumi Stack')
@ApiBearerAuth()
@Controller('project-management')
export class PulumiStackController {
  private stackService = new PulumiStackService();

  @Get('pulumi-stacks/types')
  async listStackTypes() {
    return Object.values(PulumiStackType);
  }

  /**
   * Get an pulumi stack params with example values.
   *
   * @param {string} type
   * @returns
   * @memberof PulumiStackController
   */
  @Get('pulumi-stacks/params/:type')
  @ApiParam({
    name: 'type',
    schema: {type: 'string'},
    example: PulumiStackType.AWS_S3,
  })
  async getStackParams(@Param('type') type: PulumiStackType) {
    return this.stackService.getStackParams(type);
  }

  /**
   * Get stacks.
   *
   * @returns
   * @memberof CloudFormationController
   */
  @Get('pulumi-stacks')
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
   * @memberof PulumiStackController
   */
  @Post('pulumi-stacks')
  @ApiBody({
    description: 'Create pulumi stack.',
    examples: {
      a: {
        summary: '1. HIPAA network stack',
        value: {
          projectName: 'InceptionPad',
          environment: ProjectEnvironmentType.DEVELOPMENT,
          type: PulumiStackType.NETWORK_HIPAA,
          params: {
            SNSAlarmEmail: 'henry@inceptionpad.com',
          },
        },
      },
      b: {
        summary: '2. Database stack',
        value: {
          projectName: 'Galaxy',
          environment: ProjectEnvironmentType.DEVELOPMENT,
          type: PulumiStackType.AWS_RDS,
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
      type: PulumiStackType;
      params?: object;
    }
  ) {
    const {projectName, environment, type, params} = body;

    // Pulumi stack must be under a Pulumi project.
    const pulumiProject = projectName?.replace(/ /g, '_');
    const stackName: string = type + '-' + randomCode(8);

    return await this.stackService.create({
      name: stackName,
      pulumiProject: pulumiProject,
      type: type,
      params: params,
      state: PulumiStackState.PREPARING,
      environment: environment,
      project: {connect: {name: projectName}},
    });
  }

  /**
   * Update a stack.
   *
   * @param {string} stackId
   * @param {Prisma.PulumiStackUpdateInput} body
   * @returns
   * @memberof PulumiStackController
   */
  @Post('pulumi-stacks/:stackId')
  @ApiParam({
    name: 'stackId',
    schema: {type: 'string'},
    example: 'ff337f2d-d3a5-4f2e-be16-62c75477b605',
  })
  @ApiBody({
    description: 'Update pulumi stack.',
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
    body: Prisma.PulumiStackUpdateInput
  ) {
    const {params} = body;

    return await this.stackService.update({
      where: {id: stackId},
      data: body,
    });
  }

  /**
   * Build pulumi stack.
   *
   * @param {string} stackId
   * @returns
   * @memberof PulumiStackController
   */
  @Post('pulumi-stacks/:stackId/build')
  @ApiParam({
    name: 'stackId',
    schema: {type: 'string'},
    example: 'ff337f2d-d3a5-4f2e-be16-62c75477b605',
  })
  async buildStack(
    @Param('stackId')
    stackId: string
  ) {
    // [step 1] Get the pulumi stack.
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
          message: 'This pulumi is not ready for building.',
        },
      };
    } else if (
      //stack.status === PulumiStackStatus.BUILDING ||
      stack.state === PulumiStackState.DESTROYING ||
      stack.state === PulumiStackState.DELETED
    ) {
      return {
        data: null,
        err: {
          message: 'Please check the pulumi status.',
        },
      };
    }

    // [step 2] Build the pulumi stack.
    return await this.stackService.build(
      stack.pulumiProject,
      stack.name,
      stack.type,
      stack.params
    );
  }

  /**
   * Destroy pulumi stack.
   *
   * @param {string} stackId
   * @returns
   * @memberof PulumiStackController
   */
  @Delete('pulumi-stacks/:stackId/destroy')
  @ApiParam({
    name: 'stackId',
    schema: {type: 'string'},
    example: 'ff337f2d-d3a5-4f2e-be16-62c75477b605',
  })
  async destroyStack(
    @Param('stackId')
    stackId: string
  ) {
    // [step 1] Get the pulumi stack.
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
    } else if (stack.state === PulumiStackState.DESTROY_SUCCEEDED) {
      return {
        data: null,
        err: {
          message: `The stack has been destroyed at ${stack.updatedAt}`,
        },
      };
    } else if (stack.state === PulumiStackState.DELETED) {
      return {
        data: null,
        err: {
          message: 'The stack has been deleted.',
        },
      };
    }

    // [step 2] Destroy the pulumi stack.
    return await this.stackService.destroy(stack.pulumiProject, stack.name);
  }

  /**
   * Delete pulumi stack.
   *
   * @param {string} stackId
   * @returns
   * @memberof PulumiStackController
   */
  @Delete('pulumi-stacks/:stackId/delete')
  @ApiParam({
    name: 'stackId',
    schema: {type: 'string'},
    example: 'ff337f2d-d3a5-4f2e-be16-62c75477b605',
  })
  async deleteStack(
    @Param('stackId')
    stackId: string
  ) {
    // [step 1] Get the pulumi stack.
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
      stack.state !== PulumiStackState.DESTROY_SUCCEEDED
    ) {
      return {
        data: null,
        err: {
          message: 'The stack can not be deleted before destroying.',
        },
      };
    }

    // [step 2] Delete the pulumi stack.
    return await this.stackService.deleteOnPulumi(stack);
  }

  /**
   * Force delete a Pulumi stack.
   *
   * @param {string} stackId
   * @returns
   * @memberof PulumiStackController
   */
  @Delete('pulumi-stacks/:stackId/force-delete')
  @ApiParam({
    name: 'stackId',
    schema: {type: 'string'},
    example: 'a143f94d-8698-4fc5-bd9c-45a3d965a08b',
  })
  async forceDeletePulumiStack(
    @Param('stackId')
    stackId: string
  ) {
    // [step 1] Get the pulumi stack.
    const stack = await this.stackService.findUnique({
      where: {id: stackId},
    });
    if (!stack) {
      return {
        data: null,
        err: {message: 'Invalid stackId.'},
      };
    }

    // [step 2] Destroy the pulumi stack.
    try {
      await this.stackService.destroy(stack.pulumiProject, stack.name);
    } catch (error) {
      // Do nothing
      console.log('Exception for destroying pulumi stack [', stack.name, ']');
    }

    // [step 3] Force delete the pulumi stack.
    return await this.stackService.forceDeleteOnPulumi(stack);
  }

  /* End */
}
