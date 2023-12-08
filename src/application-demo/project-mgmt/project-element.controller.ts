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
import {Prisma, ProjectElement} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@ApiTags('Project Management / Project Element')
@ApiBearerAuth()
@Controller('project-elements')
export class ProjectElementController {
  constructor(private readonly prisma: PrismaService) {}

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
    return await this.prisma.projectElement.create({
      data: body,
    });
  }

  //* Get many
  @Get('')
  async getElements(): Promise<ProjectElement[]> {
    return await this.prisma.projectElement.findMany({});
  }

  //* Get
  @Get(':elementId')
  async getElement(
    @Param('elementId') elementId: number
  ): Promise<ProjectElement> {
    return await this.prisma.projectElement.findUniqueOrThrow({
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
    return await this.prisma.projectElement.update({
      where: {id: elementId},
      data: body,
    });
  }

  //* Delete
  @Delete(':elementId')
  async deleteElement(
    @Param('elementId') elementId: number
  ): Promise<ProjectElement | null> {
    return await this.prisma.projectElement.delete({
      where: {id: elementId},
    });
  }

  /* End */
}
