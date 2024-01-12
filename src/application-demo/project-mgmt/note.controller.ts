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
import {Prisma, ProjectNote} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@ApiTags('Project Management / Project Note')
@ApiBearerAuth()
@Controller('notes')
export class ProjectNoteController {
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
  async createNote(
    @Body()
    body: Prisma.ProjectNoteUncheckedCreateInput
  ): Promise<ProjectNote> {
    // [step 1] Guard statement.
    if (!body.label) {
      throw new BadRequestException('Invalid parameters in the request body.');
    }

    // [step 2] Create project.
    return await this.prisma.projectNote.create({
      data: body,
    });
  }

  //* Get many
  @Get('')
  async getNotes(): Promise<ProjectNote[]> {
    return await this.prisma.projectNote.findMany({});
  }

  //* Get
  @Get(':elementId')
  async getNote(@Param('elementId') elementId: number): Promise<ProjectNote> {
    return await this.prisma.projectNote.findUniqueOrThrow({
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
  async updateNote(
    @Param('elementId') elementId: number,
    @Body() body: Prisma.ProjectNoteUpdateInput
  ): Promise<ProjectNote> {
    return await this.prisma.projectNote.update({
      where: {id: elementId},
      data: body,
    });
  }

  //* Delete
  @Delete(':elementId')
  async deleteNote(
    @Param('elementId') elementId: number
  ): Promise<ProjectNote | null> {
    return await this.prisma.projectNote.delete({
      where: {id: elementId},
    });
  }

  /* End */
}
