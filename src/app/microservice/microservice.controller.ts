import {Controller, Get, Post, Delete, Param, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {
  InfrastructureStackStatus,
  InfrastructureStackType,
} from '@prisma/client';
import {MicroserviceService} from './microservice.service';
import {ProjectService} from '../project/project.service';
import {InfrastructureStackService} from '../../_infrastructure-stack/_infrastructure-stack.service';

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
    return this.infrastructureStackService.getParamsByType(type);
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
  @Get('microservices/project/:microserviceId')
  @ApiParam({
    name: 'microserviceId',
    schema: {type: 'string'},
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getMicroservice(@Param('microserviceId') microserviceId: string) {
    return this.microserviceService.findOne({id: microserviceId});
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
    const createdMicroservice = await this.microserviceService.create({
      environment: body.environment,
      infrastructureStackType: body.infrastructureStackType,
      infrastructureStackParams: body.infrastructureStackParams,
      infrastructureStackStatus: InfrastructureStackStatus.CREATING,
      project: {
        connect: {id: body.projectId},
      },
    });
    if (createdMicroservice === null) {
      return {
        data: null,
        err: {message: 'Create microservice failed.'},
      };
    }

    // [step 4] Start infrastructure stack.
    const stack = await this.infrastructureStackService.create(
      project.name,
      body.infrastructureStackType,
      body.infrastructureStackParams
    );
    if (stack === null) {
      return {
        data: null,
        err: {message: 'Create infrastructure stack failed.'},
      };
    }

    // [step 5] Update microservice status.
    const updatedMicroservice = await this.microserviceService.update({
      where: {id: createdMicroservice.id},
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
          projectId: 'd8141ece-f242-4288-a60a-8675538549cd',
          environment: 'development',
          infrastructureStackType: 'ELASTIC_CONTAINER_CLUSTER',
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
    // [step 1] Verify microserviceId.
    const microservice = await this.microserviceService.findOne({
      id: microserviceId,
    });
    if (!microservice) {
      return {
        data: null,
        err: {
          message: "Please provide valid 'microserviceId' in the url.",
        },
      };
    }

    // [step 2] Update infrastructure stack.
    if (!microservice.infrastructureStackId) {
      return {
        data: null,
        err: {
          message: 'The microservice does not have infrastructure stack.',
        },
      };
    }
    const stack = await this.infrastructureStackService.update(
      microservice.infrastructureStackId,
      body.infrastructureStackParams
    );

    // [step 3] Update microservice status.
    if (stack === null) {
      return {
        data: null,
        err: {
          message: 'Update infrastructure failed.',
        },
      };
    }
    stack.stackResult;
    const updatedMicroservice = await this.microserviceService.update({
      where: {id: microserviceId},
      data: {
        infrastructureStackParams: body.infrastructureStackParams,
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
    if (
      microservice.infrastructureStackStatus ===
      InfrastructureStackStatus.DELETED
    ) {
      return {
        data: null,
        err: {
          message: `The microservice has been deleted at ${microservice.updatedAt}`,
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
