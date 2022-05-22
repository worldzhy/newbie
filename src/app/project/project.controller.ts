import {Controller, Get, Post, Param, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {ProjectService} from './project.service';
import {ValidatorService} from '../../_validator/_validator.service';
import {MicroserviceService} from '../microservice/microservice.service';
import {ProjectStatus} from '@prisma/client';

@ApiTags('App - Project')
@ApiBearerAuth()
@Controller()
export class ProjectController {
  private validator = new ValidatorService();
  private projectService = new ProjectService();
  private microserviceService = new MicroserviceService();

  /**
   * Get projects by page number. The order is by projectname.
   *
   * @param {number} page
   * @returns {Promise<{ data: object, err: object }>}
   * @memberof ProjectController
   */
  @Get('projects/pages/:page')
  @ApiParam({
    name: 'page',
    schema: {type: 'number'},
    description:
      'The page of the project list. It must be a LARGER THAN 0 integer.',
    example: 1,
  })
  async getProjectsByPage(
    @Param('page') page: number
  ): Promise<{data: object | null; err: object | null}> {
    // [step 1] Guard statement.
    let p = page;
    if (typeof page === 'string') {
      // Actually 'page' is string because it comes from URL param.
      p = parseInt(page);
    }
    if (p < 1) {
      return {
        data: null,
        err: {message: "The 'page' must be a large than 0 integer."},
      };
    }

    // [step 2] Get projects.
    const projects = await this.projectService.findMany({
      orderBy: {
        _relevance: {
          fields: ['name'],
          search: 'database',
          sort: 'asc',
        },
      },
      take: 10,
      skip: 10 * (p - 1),
    });
    return {
      data: projects,
      err: null,
    };
  }

  /**
   * Get project by id
   *
   * @param {string} projectId
   * @returns {Promise<{data: object;err: object;}>}
   * @memberof ProjectController
   */
  @Get('projects/:projectId')
  @ApiParam({
    name: 'projectId',
    schema: {type: 'string'},
    description: 'The uuid of the project.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getProject(
    @Param('projectId') projectId: string
  ): Promise<{data: object | null; err: object | null}> {
    const result = await this.projectService.findOne({id: projectId});
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Get project failed.'},
      };
    }
  }

  /**
   * Create a new project.
   *
   * @param {{
   *       projectName: string;
   *       clientName: string;
   *       clientEmail: string;
   *     }} body
   * @returns
   * @memberof ProjectController
   */
  @Post('projects')
  @ApiBody({
    description:
      "The 'projectName', 'clientName' and 'clientEmail' are required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          projectName: 'Galaxy',
          clientName: 'Henry Zhao',
          clientEmail: 'henry@inceptionpad.com',
        },
      },
    },
  })
  async createProject(
    @Body()
    body: {
      projectName: string;
      clientName: string;
      clientEmail: string;
    }
  ) {
    // [step 1] Guard statement.
    if (
      !body.projectName ||
      !this.validator.verifyProjectName(body.projectName) ||
      !body.clientName ||
      !body.clientEmail ||
      !this.validator.verifyEmail(body.clientEmail)
    ) {
      return {
        data: null,
        err: {
          message:
            "Please provide valid 'projectName', 'clientName', 'clientEmail' in the request body.",
        },
      };
    }

    // [step 2] Create project.
    const result = await this.projectService.create({
      name: body.projectName,
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      status: ProjectStatus.IN_DEVELOPMENT,
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Project create failed.'},
      };
    }
  }

  /* End */
}
