import {
  Controller,
  Delete,
  Get,
  Patch,
  Body,
  Param,
  Post,
  BadRequestException,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {ProjectElementService} from '@microservices/pmgmt/project/project-element.service';
import {Prisma, ProjectElement} from '@prisma/client';

@ApiTags('Project Management / Project Element')
@ApiBearerAuth()
@Controller('project-elements')
export class ProjectElementController {
  constructor(private readonly elementService: ProjectElementService) {}

  @Post('')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          section: 'Basic',
          label: 'Client Email',
          content: 'tom@galaxy.com',
          projectId: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
        },
      },
    },
  })
  async createElement(
    @Body()
    body: Prisma.ProjectElementUncheckedCreateInput
  ): Promise<ProjectElement> {
    // [step 1] Guard statement.
    if (!body.label) {
      throw new BadRequestException('Invalid parameters in the request body.');
    }

    // [step 2] Create project.
    return await this.elementService.create({
      data: body,
    });
  }

  //* Get many
  @Get('')
  async getElements(): Promise<ProjectElement[]> {
    return await this.elementService.findMany({});
  }

  //* Get
  @Get(':elementId')
  async getElement(
    @Param('elementId') elementId: number
  ): Promise<ProjectElement> {
    return await this.elementService.findUniqueOrThrow({
      where: {id: elementId},
    });
  }

  //* Update
  @Patch(':elementId')
  @ApiBody({
    description: 'Update element state.',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          content: 'xxxxx',
        },
      },
    },
  })
  async updateElement(
    @Param('elementId') elementId: number,
    @Body() body: Prisma.ProjectElementUpdateInput
  ): Promise<ProjectElement> {
    return await this.elementService.update({
      where: {id: elementId},
      data: body,
    });
  }

  //* Delete
  @Delete(':elementId')
  async deleteElement(
    @Param('elementId') elementId: number
  ): Promise<ProjectElement | null> {
    return await this.elementService.delete({
      where: {id: elementId},
    });
  }

  /* End */
}
