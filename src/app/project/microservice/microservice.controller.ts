import {Controller, Get, Post, Delete, Param, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {MicroserviceStatus, ProjectEnvironmentType} from '@prisma/client';
import {MicroserviceService} from './microservice.service';
import {ProjectService} from '../project.service';
import {InfrastructureStackService} from '../infrastructure-stack/infrastructure-stack.service';

@ApiTags('App / Project / Microservice')
@ApiBearerAuth()
@Controller()
export class MicroserviceController {
  private projectService = new ProjectService();
  private microserviceService = new MicroserviceService();
  private infrastructureStackService = new InfrastructureStackService();

  /**
   * Get microservices for a project.
   *
   * @param {string} projectId
   * @returns
   * @memberof MicroserviceController
   */
  @Get('microservices/projects/:projectId/:environment')
  @ApiParam({
    name: 'projectId',
    schema: {type: 'string'},
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  @ApiParam({
    name: 'environment',
    schema: {type: 'string'},
    example: 'development',
  })
  async getMicroservices(
    @Param('projectName') projectId: string,
    @Param('environment') environment: ProjectEnvironmentType
  ) {
    return this.microserviceService.findMany({projectId, environment});
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
  }

  /**
   * Create a microservice.
   *
   * @param {{
   *       projectName: string;
   *       environment: ProjectEnvironmentType;
   *       name: string;
   *     }} body
   * @returns
   * @memberof MicroserviceController
   */
  @Post('microservices')
  @ApiBody({
    description: 'Enjoy coding :)',
    examples: {
      a: {
        summary: '1. Create successfully',
        value: {
          projectName: 'InceptionPad',
          environment: ProjectEnvironmentType.DEVELOPMENT,
          name: 'Email Outreaching',
        },
      },
    },
  })
  async createMicroservice(
    @Body()
    body: {
      projectName: string;
      environment: ProjectEnvironmentType;
      name: string;
    }
  ) {
    // [step 1] Verify projectId.
    const project = await this.projectService.findOne({id: body.projectName});
    if (project === null) {
      return {
        data: null,
        err: {
          message: "Please provide valid 'projectId' in the request body.",
        },
      };
    }

    // [step 2] Create a microservice.
    return await this.microserviceService.create({
      name: body.name,
      status: MicroserviceStatus.PREPARING,
      environment: body.environment,
      project: {
        connect: {id: body.projectName},
      },
    });
  }

  /**
   * Update a microservice
   *
   * @param {string} microserviceId
   * @param {{
   *       name: string;
   *       status: MicroserviceStatus;
   *       environment: ProjectEnvironmentType;
   *     }} body
   * @returns
   * @memberof MicroserviceController
   */
  @Post('microservices/:microserviceId')
  @ApiParam({
    name: 'microserviceId',
    schema: {type: 'string'},
    example: 'e67c94cf-ee4f-4dfd-8819-fcb08b4a2e3d',
  })
  @ApiBody({
    description: 'Enjoy coding :)',
    examples: {
      a: {
        summary: '1. Launch FileManager',
        value: {
          name: 'FileManager',
          status: MicroserviceStatus.PREPARING,
          environment: ProjectEnvironmentType.DEVELOPMENT,
        },
      },
    },
  })
  async updateMicroservice(
    @Param('microserviceId') microserviceId: string,
    @Body()
    body: {
      name: string;
      status: MicroserviceStatus;
      environment: ProjectEnvironmentType;
    }
  ) {
    const {name, status, environment} = body;
    return await this.microserviceService.update({
      where: {id: microserviceId},
      data: {name, status, environment},
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
    return await this.microserviceService.delete({id: microserviceId});
  }

  /* End */
}
