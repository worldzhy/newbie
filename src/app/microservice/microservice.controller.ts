import {Controller, Get, Post, Delete, Param, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {
  InfrastructureStackStatus,
  InfrastructureStackType,
} from '@prisma/client';
import {MicroserviceService} from './microservice.service';
import {ProjectService} from '../project/project.service';
import {InfrastructureStackService} from '../infrastructure-stack/infrastructure-stack.service';

@ApiTags('App - Microservice')
@ApiBearerAuth()
@Controller()
export class MicroserviceController {
  private projectService = new ProjectService();
  private microserviceService = new MicroserviceService();
  private infrastructureStackService = new InfrastructureStackService();

  /**
   * Get all the microservice types.
   *
   * @returns
   * @memberof MicroserviceController
   */
  @Get('microservices/types')
  async getInfrastructureTypes() {
    return this.microserviceService.listAllTypes();
  }

  @Get('microservices/types/:type/params')
  @ApiParam({
    name: 'type',
    schema: {type: 'string'},
    example: InfrastructureStackType.AWS_CODE_COMMIT,
  })
  async getInfrastructureParamsByType(
    @Param('type') type: InfrastructureStackType
  ) {
    return this.infrastructureStackService.getStackParamsByType(type);
  }

  /**
   * Get microservices for a project.
   *
   * @param {string} projectId
   * @returns
   * @memberof MicroserviceController
   */
  @Get('microservices/project/:projectId')
  @ApiParam({
    name: 'projectId',
    schema: {type: 'string'},
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getMicroservices(@Param('projectId') projectId: string) {
    return this.microserviceService.findMany({where: {projectId}});
  }

  /**
   * Get microservice with infrastructure stack.
   *
   * @param {string} microserviceId
   * @returns
   * @memberof MicroserviceController
   */
  @Get('microservices/:microserviceId')
  @ApiParam({
    name: 'microserviceId',
    schema: {type: 'string'},
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getMicroservice(@Param('microserviceId') microserviceId: string) {
    // [step 1] Get microservice database record.
    return await this.microserviceService.findOne({
      id: microserviceId,
    });

    // [step 2] Get infrastructure stack information.
    /* if (microservice?.infrastructureStackId) {
      const info = await this.infrastructureStackService.info(
        microservice?.infrastructureStackId
      );
    } */
  }

  /**
   * Create a microservice
   *
   * @param {{
   *       projectId: string;
   *       environment: string;
   *       infrastructureType: string;
   *       microserviceParams: object;
   *     }} body
   * @returns
   * @memberof ProjectController
   */
  @Post('microservices')
  @ApiBody({
    description:
      "The 'projectId'and 'infrastructureType' are required in request body.",
    examples: {
      a: {
        summary: '1. Launch AWS CodeCommit',
        value: {
          projectId: 'dcfb8c4d-b2c8-495a-a4f8-8959bc03d322',
          environment: 'development',
          infrastructureStackType: InfrastructureStackType.AWS_CODE_COMMIT,
          infrastructureStackParams: {
            repositoryName: 'pulumi-test-repository',
          },
        },
      },
    },
  })
  async createMicroservice(
    @Body()
    body: {
      projectId: string;
      environment: string;
      awsRegion?: string;
      infrastructureStackType: InfrastructureStackType;
      infrastructureStackParams: object;
    }
  ) {
    // [step 1] Verify infrastructureType.
    if (
      !body.infrastructureStackType ||
      !this.microserviceService
        .listAllTypes()
        .includes(body.infrastructureStackType)
    ) {
      return {
        data: null,
        err: {
          message:
            "Please provide valid 'infrastructureType' in the request body. Use 'microservices/types' API to get available types.",
        },
      };
    }

    // [step 2] Verify projectId.
    const project = await this.projectService.findOne({id: body.projectId});
    if (project === null) {
      return {
        data: null,
        err: {
          message: "Please provide valid 'projectId' in the request body.",
        },
      };
    }

    // [step 3] Create a microservice.
    return await this.microserviceService.create({
      environment: body.environment,
      awsRegion: body.awsRegion ? body.awsRegion : project.awsRegion,
      infrastructureStackType: body.infrastructureStackType,
      infrastructureStackParams: body.infrastructureStackParams,
      infrastructureStackStatus: InfrastructureStackStatus.PARAMS_CORRECT,
      project: {
        connect: {id: body.projectId},
      },
    });
  }

  /**
   * Update a microservice
   *
   * @param {{
   *       projectId: string;
   *       environment: string;
   *       infrastructureType: string;
   *       microserviceParams: object;
   *     }} body
   * @returns
   * @memberof ProjectController
   */
  @Post('microservices/:microserviceId')
  @ApiParam({
    name: 'microserviceId',
    schema: {type: 'string'},
    example: 'e67c94cf-ee4f-4dfd-8819-fcb08b4a2e3d',
  })
  @ApiBody({
    description:
      "The 'projectId'and 'infrastructureType' are required in request body.",
    examples: {
      a: {
        summary: '1. Launch FileManager',
        value: {
          infrastructureStackParams: {
            instanceName: 'postgres-default',
            instanceClass: 'db.t3.micro',
          },
        },
      },
    },
  })
  async updateMicroservice(
    @Param('microserviceId') microserviceId: string,
    @Body()
    body: {
      infrastructureStackParams: object;
    }
  ) {
    return await this.microserviceService.update({
      where: {id: microserviceId},
      data: {infrastructureStackParams: body.infrastructureStackParams},
    });
  }

  /**
   * Delete a microservice.
   *
   * @param {string} microserviceId
   * @returns
   * @memberof MicroserviceController
   */
  @Delete('microservices/:microserviceId')
  @ApiParam({
    name: 'microserviceId',
    schema: {type: 'string'},
    example: 'ff337f2d-d3a5-4f2e-be16-62c75477b605',
  })
  async deleteMicroservice(
    @Param('microserviceId')
    microserviceId: string
  ) {
    // [step 1] Get the microservice.
    const microservice = await this.microserviceService.findOne({
      id: microserviceId,
    });
    if (!microservice) {
      return {
        data: null,
        err: {message: 'Invalid microserviceId.'},
      };
    }

    // [step 2] Verify infrastructure status.
    if (
      microservice.infrastructureStackStatus !==
      InfrastructureStackStatus.DESTROY_SUCCEEDED
    ) {
      return {
        data: null,
        err: {
          message: 'The microservice can not be deleted before destroying.',
        },
      };
    }

    // [step 3] Delete microservice.
    return await this.microserviceService.delete({id: microserviceId});
  }

  /**
   * Build microservice.
   *
   * @param {string} microserviceId
   * @returns
   * @memberof MicroserviceController
   */
  @Post('microservices/:microserviceId/build')
  @ApiParam({
    name: 'microserviceId',
    schema: {type: 'string'},
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async buildMicroservice(
    @Param('microserviceId')
    microserviceId: string
  ) {
    // [step 1] Verify microserviceId.
    const microservice = await this.microserviceService.findOne({
      id: microserviceId,
    });
    if (microservice === null) {
      return {
        data: null,
        err: {
          message: "Please provide valid 'microserviceId'.",
        },
      };
    }

    // [step 2] Verify infrastructure parameters.
    if (
      microservice.infrastructureStackStatus !==
        InfrastructureStackStatus.PARAMS_CORRECT ||
      microservice.infrastructureStackType === null ||
      microservice.infrastructureStackParams === null ||
      microservice.awsRegion === null
    ) {
      return {
        data: null,
        err: {
          message: 'This microservice is not ready for building.',
        },
      };
    }

    // [step 3] Start infrastructure stack.
    await this.microserviceService.update({
      where: {
        id: microserviceId,
      },
      data: {infrastructureStackStatus: InfrastructureStackStatus.CREATING},
    });

    const stack = await this.infrastructureStackService
      .setAwsRegion(microservice.awsRegion)
      .create(
        microservice.project.name,
        microservice.infrastructureStackType,
        microservice.infrastructureStackParams
      );
    if (stack === null) {
      return {
        data: null,
        err: {message: 'Create infrastructure stack failed.'},
      };
    }

    // [step 4] Update microservice status.
    const updatedMicroservice = await this.microserviceService.update({
      where: {id: microserviceId},
      data: {
        infrastructureStackId: stack.id,
        infrastructureStackStatus: stack.status,
        infrastructureStackUpResult: JSON.parse(
          JSON.stringify(stack.stackResult)
        ),
      },
    });

    return {
      data: updatedMicroservice,
      err: null,
    };
  }

  /**
   * Destroy microservice.
   *
   * @param {string} microserviceId
   * @returns
   * @memberof MicroserviceController
   */
  @Delete('microservices/:microserviceId/destroy')
  @ApiParam({
    name: 'microserviceId',
    schema: {type: 'string'},
    example: 'ff337f2d-d3a5-4f2e-be16-62c75477b605',
  })
  async destroyMicroservice(
    @Param('microserviceId')
    microserviceId: string
  ) {
    // [step 1] Get the microservice.
    const microservice = await this.microserviceService.findOne({
      id: microserviceId,
    });
    if (!microservice) {
      return {
        data: null,
        err: {message: 'Invalid microserviceId.'},
      };
    }
    if (
      microservice.infrastructureStackStatus ===
      InfrastructureStackStatus.DESTROY_SUCCEEDED
    ) {
      return {
        data: null,
        err: {
          message: `The microservice has been destroyed at ${microservice.updatedAt}`,
        },
      };
    }

    // [step 2] Destroy infrastructure stack.
    if (!microservice.infrastructureStackId) {
      return {
        data: null,
        err: {
          message: 'The microservice does not have infrastructure stack.',
        },
      };
    }
    const stack = await this.infrastructureStackService.destroyAndDelete(
      microservice.infrastructureStackId
    );
    if (stack === null) {
      return {
        data: microservice,
        err: {
          message: 'Destroy infrastructure stack failed.',
        },
      };
    }
    const destroyedAndDeletedMicroservice =
      await this.microserviceService.update({
        where: {id: microserviceId},
        data: {
          infrastructureStackStatus: stack.status,
          infrastructureStackDestroyResult: JSON.parse(
            JSON.stringify(stack.stackResult)
          ),
        },
      });

    return {
      data: destroyedAndDeletedMicroservice,
      err: null,
    };
  }

  /* End */
}
