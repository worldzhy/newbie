import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  BadRequestException,
  Query,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {verifyProjectName} from '@toolkit/validators/project.validator';

import {Prisma, Project} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@ApiTags('Project')
@ApiBearerAuth()
@Controller('projects')
export class ProjectController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'Galaxy',
        },
      },
    },
  })
  async createProject(
    @Body()
    body: Prisma.ProjectCreateInput
  ): Promise<Project> {
    // [step 1] Guard statement.
    if (!body.name || !verifyProjectName(body.name)) {
      throw new BadRequestException(
        'Invalid project name in the request body.'
      );
    }

    // [step 2] Create project.
    return await this.prisma.project.create({data: {name: body.name}});
  }

  @Get('')
  async getProjects(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('name') name?: string
  ) {
    // [step 1] Construct where argument.
    let where: Prisma.ProjectWhereInput | undefined;
    const whereConditions: object[] = [];
    if (name) {
      name = name.trim();
      if (name.length > 0) {
        whereConditions.push({name: {contains: name}});
      }
    }

    if (whereConditions.length > 1) {
      where = {OR: whereConditions};
    } else if (whereConditions.length === 1) {
      where = whereConditions[0];
    } else {
      // where === undefined
    }

    // [step 2] Get records.
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.Project,
      pagination: {page, pageSize},
      findManyArgs: {where},
    });
  }

  @Get(':projectId')
  async getProject(@Param('projectId') projectId: string): Promise<Project> {
    return await this.prisma.project.findUniqueOrThrow({
      where: {id: projectId},
    });
  }

  @Patch(':projectId')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          name: 'Galaxy',
        },
      },
    },
  })
  async updateProject(
    @Param('projectId') projectId: string,
    @Body() body: Prisma.ProjectUpdateInput
  ): Promise<Project> {
    return await this.prisma.project.update({
      where: {id: projectId},
      data: body,
    });
  }

  @Delete(':projectId')
  async deleteProject(@Param('projectId') projectId: string): Promise<Project> {
    return await this.prisma.project.delete({where: {id: projectId}});
  }

  /* End */
}
