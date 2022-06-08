import {Controller, Get, Post, Delete, Param, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {InfrastructureStackService} from './infrastructure-stack.service';
import {EnvironmentService} from '../environment/environment.service';
import {
  InfrastructureStackManager,
  InfrastructureStackStatus,
  InfrastructureStackType,
  ProjectEnvironmentType,
} from '@prisma/client';
import {CommonUtil} from 'src/_util/_common.util';

@ApiTags('App - Infrastructure Stack')
@ApiBearerAuth()
@Controller()
export class InfrastructureStackController {
  private stackService = new InfrastructureStackService();
  private environmentService = new EnvironmentService();

  @Get('infrastructure-stacks/types')
  async getStackTypes() {
    return Object.values(InfrastructureStackType);
  }

  /**
   * Get an infrastructure stack params with example values.
   *
   * @param {string} type
   * @returns
   * @memberof InfrastructureStackController
   */
  @Get('infrastructure-stacks/:type/params')
  @ApiParam({
    name: 'type',
    schema: {type: 'string'},
    example: InfrastructureStackType.AWS_CODE_COMMIT,
  })
  async getStackParams(@Param('type') type: InfrastructureStackType) {
    return this.stackService.getStackParams(type);
  }

  /**
   * List stacks.
   *
   * @returns
   * @memberof InfrastructureStackController
   */
  @Get('infrastructure-stacks/projects/:projectId/:environment')
  @ApiParam({
    name: 'projectId',
    schema: {type: 'string'},
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  @ApiParam({
    name: 'environment',
    schema: {type: 'string'},
    example: 'development',
  })
  async getStacks(
    @Param('projectName') projectId: string,
    @Param('environment') environment: ProjectEnvironmentType
  ) {
    return await this.stackService.findMany({
      projectId: projectId,
      environment: environment,
    });
  }

  /**
   * Get a stack information.
   *
   * @param {string} infrastructureStackId
   * @returns
   * @memberof InfrastructureStackController
   */
  @Get('infrastructure-stacks/:infrastructureStackId')
  @ApiParam({
    name: 'infrastructureStackId',
    schema: {type: 'string'},
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  async getStack(
    @Param('infrastructureStackId')
    infrastructureStackId: string
  ) {
    return await this.stackService.findOne({id: infrastructureStackId});
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
        summary: '1. AWS VPC stack',
        value: {
          projectName: 'Galaxy',
          environment: ProjectEnvironmentType.DEVELOPMENT,
          type: InfrastructureStackType.AWS_VPC,
          params: {
            vpcName: 'pulumi-test-vpc',
            vpcCidrBlock: '10.21.0.0/16',
          },
        },
      },
      b: {
        summary: '2. Database stack',
        value: {
          projectName: 'Galaxy',
          environment: ProjectEnvironmentType.DEVELOPMENT,
          type: InfrastructureStackType.AWS_RDS,
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
      type: InfrastructureStackType;
      params?: object;
    }
  ) {
    const {type, params, projectName, environment} = body;

    return await this.stackService.create({
      name: type + '-' + CommonUtil.randomCode(8),
      type: type,
      params: params,
      status: InfrastructureStackStatus.PREPARING,
      manager: InfrastructureStackManager.PULUMI,
      pulumiProjectName: projectName,
      environment: environment,
      project: {connect: {name: projectName}},
    });
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
    }
    if (
      false === this.stackService.checkStackParams(stack.type, stack.params)
    ) {
      return {
        data: null,
        err: {
          message: 'This infrastructure is not ready for building.',
        },
      };
    } else if (stack.status === InfrastructureStackStatus.DELETED) {
      return {
        data: null,
        err: {
          message: 'This infrastructure has been deleted.',
        },
      };
    }

    // [step 2] Destroy the infrastructure stack.
    const environment = await this.environmentService.findOne({
      type_projectId: {type: stack.environment, projectId: stack.projectId},
    });
    if (environment?.awsRegion) {
      return await this.stackService
        .setAwsRegion(environment.awsRegion)
        .build(infrastructureStackId);
    } else {
      return {
        data: null,
        err: {
          message: 'Missing AWS region.',
        },
      };
    }
  }

  /**
   * Destroy infrastructure stack.
   *
   * @param {string} microserviceId
   * @returns
   * @memberof MicroserviceController
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
    if (stack.upResult === null) {
      return {
        data: null,
        err: {
          message: 'The stack has not been built.',
        },
      };
    } else if (stack.status === InfrastructureStackStatus.DESTROY_SUCCEEDED) {
      return {
        data: null,
        err: {
          message: `The stack has been destroyed at ${stack.updatedAt}`,
        },
      };
    } else if (stack.status === InfrastructureStackStatus.DELETED) {
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
    if (
      stack.upResult !== null &&
      stack.status !== InfrastructureStackStatus.DESTROY_SUCCEEDED
    ) {
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

  /* End */
}
