import {Controller, Get, Post, Delete, Param, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {MicroserviceStatus, MicroserviceType} from '@prisma/client';
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
  async getMicroserviceTypes() {
    return this.microserviceService.listAllTypes();
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
   *       microserviceType: string;
   *       microserviceParams: object;
   *     }} body
   * @returns
   * @memberof ProjectController
   */
  @Post('microservices')
  @ApiBody({
    description:
      "The 'projectId'and 'microserviceType' are required in request body.",
    examples: {
      a: {
        summary: '1. Launch FileManager',
        value: {
          projectId: 'd8141ece-f242-4288-a60a-8675538549cd',
          microserviceType: 'FILE_MANAGER',
          environment: 'development',
          microserviceParams: {
            instanceName: 'postgres-default',
            instanceClass: 'db.t3.micro',
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
      microserviceType: MicroserviceType;
      microserviceParams: object;
    }
  ) {
    // [step 1] Verify microserviceType.
    if (
      !body.microserviceType ||
      !this.microserviceService.listAllTypes().includes(body.microserviceType)
    ) {
      return {
        data: null,
        err: {
          message:
            "Please provide valid 'microserviceType' in the request body. Use 'microservices/types' API to get available types.",
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
      type: body.microserviceType,
      environment: body.environment,
      status: MicroserviceStatus.CREATING,
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
      body.microserviceType,
      body.microserviceParams
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
        status: stack.status,
        infrastructureStackId: stack.id,
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
   *       microserviceType: string;
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
      "The 'projectId'and 'microserviceType' are required in request body.",
    examples: {
      a: {
        summary: '1. Launch FileManager',
        value: {
          projectId: 'd8141ece-f242-4288-a60a-8675538549cd',
          environment: 'development',
          microserviceType: 'ELASTIC_CONTAINER_CLUSTER',
          microserviceParams: {
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
      microserviceParams: object;
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
      body.microserviceParams
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
        status: stack.status,
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
    if (microservice.status === MicroserviceStatus.DELETED) {
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
          status: stack.status,
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
