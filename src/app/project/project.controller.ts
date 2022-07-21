import {Controller, Get, Post, Param, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {ProjectService} from './project.service';
import {EnvironmentService} from './environment/environment.service';
import {AccountValidator} from '../../_validator/_account.validator';
import {ProjectValidator} from '../../_validator/_project.validator';
import {ProjectEnvironmentType, ProjectStatus} from '@prisma/client';

@ApiTags('App / Project')
@ApiBearerAuth()
@Controller()
export class ProjectController {
  private projectService = new ProjectService();
  private environmentService = new EnvironmentService();

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
      !ProjectValidator.verifyProjectName(body.projectName) ||
      !body.clientName ||
      !body.clientEmail ||
      !AccountValidator.verifyEmail(body.clientEmail)
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
      environments: {
        createMany: {
          skipDuplicates: true,
          data: [
            {type: ProjectEnvironmentType.DEVELOPMENT},
            {type: ProjectEnvironmentType.STAGING},
            {type: ProjectEnvironmentType.PRODUCTION},
          ],
        },
      },
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

  /**
   * Update project environment
   *
   * @param {string} projectId
   * @param {ProjectEnvironmentType} type
   * @param {{cfTemplateS3: string}} body
   * @returns
   * @memberof ProjectController
   */
  @Post('projects/:projectId/environment/:type')
  @ApiParam({
    name: 'projectId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  @ApiParam({
    name: 'type',
    schema: {type: 'string'},
    example: ProjectEnvironmentType.DEVELOPMENT,
  })
  @ApiBody({
    description: 'Update environment variables.',
    examples: {
      a: {
        summary: '1. Update cfTemplateS3',
        value: {
          cfTemplateS3: 'aws-quickstart',
        },
      },
    },
  })
  async updateProjectEnvironment(
    @Param('projectId') projectId: string,
    @Param('type') type: ProjectEnvironmentType,
    @Body() body: {cfTemplateS3: string}
  ) {
    // [step 1] Guard statement.
    const {cfTemplateS3} = body;

    // [step 2] Update environment.
    const result = await this.environmentService.update({
      where: {type_projectId: {type: type, projectId: projectId}},
      data: {cfTemplateS3},
    });
    if (result) {
      return {
        data: result,
        err: null,
      };
    } else {
      return {
        data: null,
        err: {message: 'Environment updated failed.'},
      };
    }
  }

  /* End */
}
