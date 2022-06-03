import {Controller, Get, Post, Delete, Param, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {InfrastructureStackService} from './_infrastructure-stack.service';
import {InfrastructureStackType} from '@prisma/client';
import {Enum} from '../_config/_common.enum';

@ApiTags('Infrastructure Stack')
@ApiBearerAuth()
@Controller()
export class InfrastructureStackController {
  private stackService = new InfrastructureStackService();

  /**
   * List stacks available to the authenticated user.
   *
   * @returns
   * @memberof InfrastructureStackController
   */
  @Get('infrastructure-stacks/projects/:projectName')
  @ApiParam({
    name: 'projectName',
    schema: {type: 'string'},
    example: 'TitanHouse',
  })
  async getStacks(@Param('projectName') projectName: string) {
    return await this.stackService.findMany(projectName);
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
    return await this.stackService.findOne(infrastructureStackId);
  }

  /**
   * Start a stack.
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
    description: 'Start a stack.',
    examples: {
      a: {
        summary: '1. AWS VPC stack',
        value: {
          projectName: 'Galaxy',
          stackName: Enum.environment.DEVELOPMENT,
          stackType: InfrastructureStackType.AWS_VPC,
          stackParams: {
            vpcName: 'pulumi-test-vpc',
            vpcCidrBlock: '10.21.0.0/16',
          },
        },
      },
      b: {
        summary: '2. Database stack',
        value: {
          projectName: 'Galaxy',
          stackName: Enum.environment.DEVELOPMENT,
          stackType: InfrastructureStackType.DATABASE,
          stackParams: {
            instanceName: 'postgres-default',
            instanceClass: 'db.t3.micro',
          },
        },
      },
    },
  })
  async createInfrastructure(
    @Body()
    body: {
      projectName: string;
      stackName: string;
      stackType: InfrastructureStackType;
      stackParams: object;
    }
  ) {
    return await this.stackService.create(
      body.projectName,
      body.stackType,
      body.stackParams
    );
  }

  /**
   * Delete infrastructure
   *
   * @param {string} infrastructureStackId
   * @returns
   * @memberof InfrastructureStackController
   */
  @Delete('infrastructure-stacks/:infrastructureStackId')
  @ApiParam({
    name: 'infrastructureStackId',
    schema: {type: 'string'},
    example: 'ff337f2d-d3a5-4f2e-be16-62c75477b605',
  })
  async destroyAndDeleteInfrastructure(
    @Param('infrastructureStackId')
    infrastructureStackId: string
  ) {
    return await this.stackService.destroyAndDelete(infrastructureStackId);
  }

  /**
   * Get a microservice params and default values by its type.
   *
   * @param {string} type
   * @returns
   * @memberof MicroserviceController
   */
  @Get('infrastructure-stacks/types/:type/params')
  @ApiParam({
    name: 'type',
    schema: {type: 'string'},
    example: 'ELASTIC_CONTAINER_CLUSTER',
  })
  async getParams(@Param('type') type: string) {
    return this.stackService.getParamsByType(type as InfrastructureStackType);
  }

  /* End */
}
