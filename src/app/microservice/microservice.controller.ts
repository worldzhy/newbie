import {Controller, Get, Post, Delete, Param, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {
  MicroserviceStatus,
  MicroserviceType,
  Project,
  PulumiStackType,
} from '@prisma/client';
import {MicroserviceService} from './microservice.service';
import {ProjectService} from '../project/project.service';
import {InfrastructureService} from '../infrastructure/infrastructure.service';
import {identity} from 'rxjs';

@ApiTags('App - Microservice')
@ApiBearerAuth()
@Controller()
export class MicroserviceController {
  private microserviceService = new MicroserviceService();
  private projectService = new ProjectService();
  private infrastructureService = new InfrastructureService();

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
   * Get a microservice params and default values by its type.
   *
   * @param {string} type
   * @returns
   * @memberof MicroserviceController
   */
  @Get('microservices/types/:type/params')
  @ApiParam({
    name: 'type',
    schema: {type: 'string'},
    example: 'Database',
  })
  async getMicroserviceParams(@Param('type') type: string) {
    return this.microserviceService.getParamsByServiceType(type);
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
    if (false === (await this.projectService.checkExistence(body.projectId))) {
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
    if (!createdMicroservice) {
      return {
        data: null,
        err: {message: 'Create microservice failed.'},
      };
    }

    // [step 4] Start infrastructure stack.
    const stackUpResult = await this.infrastructureService.startStack(
      body.microserviceType,
      body.environment,
      body.microserviceParams
    );

    // [step 5] Update microservice status.
    const updatedMicroservice = await this.microserviceService.update({
      where: {id: createdMicroservice.id},
      data: {
        status:
          stackUpResult?.summary.result === 'succeeded'
            ? MicroserviceStatus.CREATE_SUCCEEDED
            : MicroserviceStatus.CREATE_FAILED,
        pulumiStackType: body.microserviceType,
        pulumiStackName: body.environment,
        pulumiStackUpResult: JSON.parse(JSON.stringify(stackUpResult)),
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
    if (false === (await this.projectService.checkExistence(body.projectId))) {
      return {
        data: null,
        err: {
          message: "Please provide valid 'projectId' in the request body.",
        },
      };
    }

    // [step 3] Verify microserviceId.
    if (
      false === (await this.microserviceService.checkExistence(microserviceId))
    ) {
      return {
        data: null,
        err: {message: 'Update microservice failed.'},
      };
    }

    // [step 4] Update infrastructure stack.
    const stackUpResult = await this.infrastructureService.startStack(
      body.microserviceType,
      body.environment,
      body.microserviceParams
    );

    // [step 5] Update microservice status.
    const updatedMicroservice = await this.microserviceService.update({
      where: {id: microserviceId},
      data: {
        status:
          stackUpResult?.summary.result === 'succeeded'
            ? MicroserviceStatus.UPDATE_SUCCEEDED
            : MicroserviceStatus.UPDATE_FAILED,
        pulumiStackType: body.microserviceType,
        pulumiStackName: body.environment,
        pulumiStackUpResult: JSON.parse(JSON.stringify(stackUpResult)),
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

    // [step 2] Destroy and delete the infrastructure stack.
    let stackDestroyResult: object | undefined;
    let stackDeleteResult: object | undefined;
    if (
      microservice.pulumiStackName &&
      microservice.pulumiStackType &&
      Object.values(PulumiStackType).includes(microservice.pulumiStackType)
    ) {
      stackDestroyResult = await this.infrastructureService.destroyStack(
        microservice.pulumiStackType,
        microservice.pulumiStackName
      );

      stackDeleteResult = await this.infrastructureService.deleteStack(
        'worldzhy',
        microservice.pulumiStackType,
        microservice.pulumiStackName
      );
    }

    // [step 3] Set microservice status 'deleted'.
    const deletedMicroservice = await this.microserviceService.update({
      where: {id: microserviceId},
      data: {
        status: MicroserviceStatus.DELETED,
        pulumiStackDestroyResult: stackDestroyResult,
        pulumiStackDeleteResult: stackDeleteResult,
      },
    });

    return {
      data: deletedMicroservice,
      err: null,
    };
  }

  /* End */
}
