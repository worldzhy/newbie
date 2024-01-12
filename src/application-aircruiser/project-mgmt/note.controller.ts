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

@ApiTags('Project Note')
@ApiBearerAuth()
@Controller('project-notes')
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

  @Get('')
  async getNotes(): Promise<ProjectNote[]> {
    return await this.prisma.projectNote.findMany({});
  }

  @Get(':noteId')
  async getNote(@Param('noteId') noteId: number): Promise<ProjectNote> {
    return await this.prisma.projectNote.findUniqueOrThrow({
      where: {id: noteId},
    });
  }

  @Patch(':noteId')
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
    @Param('noteId') noteId: number,
    @Body() body: Prisma.ProjectNoteUpdateInput
  ): Promise<ProjectNote> {
    return await this.prisma.projectNote.update({
      where: {id: noteId},
      data: body,
    });
  }

  @Delete(':noteId')
  async deleteNote(
    @Param('noteId') noteId: number
  ): Promise<ProjectNote | null> {
    return await this.prisma.projectNote.delete({
      where: {id: noteId},
    });
  }

  /* End */
}
