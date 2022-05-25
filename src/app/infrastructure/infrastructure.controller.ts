import {Controller, Get, Post, Delete, Param, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {InfrastructureService} from './infrastructure.service';
import {PulumiStackType} from '@prisma/client';
import {Enum} from '../../_common/_common.enum';

@ApiTags('App - Infrastructure')
@ApiBearerAuth()
@Controller()
export class InfrastructureController {
  private infrastructureService = new InfrastructureService();

  /**
   * List stacks available to the authenticated user.
   *
   * @returns
   * @memberof InfrastructureController
   */
  @Get('infrastructure/stacks')
  async listStacks() {
    const res = await this.infrastructureService.listStacks();
    if (res.data) {
      return res.data.stacks;
    } else {
      return null;
    }
  }

  /**
   * Get a stack information.
   *
   * @returns
   * @memberof InfrastructureController
   */
  @Get('infrastructure/stacks/:pulumiOrgName/:pulumiStackType/:pulumiStackName')
  @ApiParam({
    name: 'pulumiOrgName',
    schema: {type: 'string'},
    example: 'worldzhy',
  })
  @ApiParam({
    name: 'pulumiStackType',
    schema: {type: 'string'},
    example: PulumiStackType.FILE_MANAGER,
  })
  @ApiParam({
    name: 'pulumiStackName',
    schema: {type: 'string'},
    example: Enum.environment.DEVELOPMENT,
  })
  async getStack(
    @Param('pulumiOrgName')
    pulumiOrgName: string,
    @Param('pulumiStackType')
    pulumiStackType: string,
    @Param('pulumiStackName')
    pulumiStackName: string
  ) {
    const res = await this.infrastructureService.getStack(
      pulumiOrgName,
      pulumiStackType,
      pulumiStackName
    );
    if (res.data) {
      return res.data;
    } else {
      return null;
    }
  }

  /**
   * Get a stack state information.
   *
   * @returns
   * @memberof InfrastructureController
   */
  @Get(
    'infrastructure/stacks/:pulumiOrgName/:pulumiStackType/:pulumiStackName/state'
  )
  @ApiParam({
    name: 'pulumiOrgName',
    schema: {type: 'string'},
    example: 'worldzhy',
  })
  @ApiParam({
    name: 'pulumiStackType',
    schema: {type: 'string'},
    example: PulumiStackType.FILE_MANAGER,
  })
  @ApiParam({
    name: 'pulumiStackName',
    schema: {type: 'string'},
    example: Enum.environment.DEVELOPMENT,
  })
  async getStackState(
    @Param('pulumiOrgName')
    pulumiOrgName: string,
    @Param('pulumiStackType')
    pulumiStackType: string,
    @Param('pulumiStackName')
    pulumiStackName: string
  ) {
    const res = await this.infrastructureService.getStackState(
      pulumiOrgName,
      pulumiStackType,
      pulumiStackName
    );
    if (res.data) {
      return res.data;
    } else {
      return null;
    }
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
   * @memberof InfrastructureController
   */
  @Post('infrastructure/stacks')
  @ApiBody({
    description: 'Start a stack.',
    examples: {
      a: {
        summary: '1. Database stack',
        value: {
          stackType: PulumiStackType.NETWORK,
          stackParams: {
            instanceName: 'postgres-default',
            instanceClass: 'db.t3.micro',
          },
          stackName: Enum.environment.DEVELOPMENT,
        },
      },
    },
  })
  async startStack(
    @Body()
    body: {
      stackType: string;
      stackName: string;
      stackParams: object;
    }
  ) {
    return await this.infrastructureService.startStack(
      body.stackType,
      body.stackName,
      body.stackParams
    );
  }

  /**
   * Destroy a stack
   *
   * @param {{
   *       stackType: string;
   *       projectName: string;
   *       environment: string;
   *     }} body
   * @memberof InfrastructureController
   */
  @Post('infrastructure/stacks/destroy')
  @ApiBody({
    description: 'Destroy a stack.',
    examples: {
      a: {
        summary: '1. Database stack',
        value: {
          stackType: PulumiStackType.NETWORK,
          stackName: Enum.environment.DEVELOPMENT,
        },
      },
    },
  })
  async destroyStack(
    @Body()
    body: {
      stackType: string;
      stackName: string;
    }
  ) {
    return await this.infrastructureService.destroyStack(
      body.stackType,
      body.stackName
    );
  }

  /**
   * Delete a stack
   * @param {string} pulumiOrgName
   * @param {string} pulumiStackType
   * @param {string} pulumiStackName
   * @returns
   * @memberof InfrastructureController
   */
  @Delete(
    'infrastructure/stacks/:pulumiOrgName/:pulumiStackType/:pulumiStackName'
  )
  @ApiParam({
    name: 'pulumiOrgName',
    schema: {type: 'string'},
    example: 'worldzhy',
  })
  @ApiParam({
    name: 'pulumiStackType',
    schema: {type: 'string'},
    example: PulumiStackType.FILE_MANAGER,
  })
  @ApiParam({
    name: 'pulumiStackName',
    schema: {type: 'string'},
    example: Enum.environment.DEVELOPMENT,
  })
  async deleteStack(
    @Param('pulumiOrgName')
    pulumiOrgName: string,
    @Param('pulumiStackType')
    pulumiStackType: string,
    @Param('pulumiStackName')
    pulumiStackName: string
  ) {
    const res = await this.infrastructureService.deleteStack(
      pulumiOrgName,
      pulumiStackType,
      pulumiStackName
    );
    return JSON.parse(JSON.stringify(res));
  }

  /* End */
}
