import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  BadRequestException,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {JobApplicationNoteService} from './note.service';

import {JobApplicationNote, PermissionAction, Prisma} from '@prisma/client';
import {JobApplicationService} from '../job-application.service';
import {RequirePermission} from '../../../account/authorization/authorization.decorator';

@ApiTags('[Application] Recruitment / Job Application / Note')
@ApiBearerAuth()
@Controller('recruitment-job-application-notes')
export class JobApplicationNoteController {
  private jobApplicationNoteService = new JobApplicationNoteService();
  private jobApplicationService = new JobApplicationService();

  //* Create
  @Post('')
  @RequirePermission(
    PermissionAction.create,
    Prisma.ModelName.JobApplicationNote
  )
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          reporterUserId: 'ababdab1-5d91-4af7-ab2b-e2c9744a88d4',
          reporterComment: 'This an example task.',
          jobApplicationId: 'ababdab1-5d91-4af7-ab2b-e2c9744a88d4',
        },
      },
    },
  })
  async createJobApplicationNote(
    @Body()
    body: Prisma.JobApplicationNoteUncheckedCreateInput
  ): Promise<JobApplicationNote> {
    // [step 1] Guard statement.
    if (
      !(await this.jobApplicationService.checkExistence(body.jobApplicationId))
    ) {
      throw new BadRequestException(
        'Invalid jobApplicationId in the request body.'
      );
    }

    // [step 2] Create jobApplicationNote.
    return await this.jobApplicationNoteService.create({data: body});
  }

  //* Get many
  @Get('')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.JobApplicationNote)
  async getJobApplicationNotes(): Promise<JobApplicationNote[]> {
    return await this.jobApplicationNoteService.findMany({});
  }

  //* Get
  @Get(':noteId')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.JobApplicationNote)
  @ApiParam({
    name: 'noteId',
    schema: {type: 'string'},
    description: 'The uuid of the jobApplicationNote.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getJobApplicationNote(
    @Param('noteId') noteId: string
  ): Promise<JobApplicationNote | null> {
    return await this.jobApplicationNoteService.findUnique({
      where: {id: parseInt(noteId)},
    });
  }

  //* Update
  @Patch(':noteId')
  @RequirePermission(
    PermissionAction.update,
    Prisma.ModelName.JobApplicationNote
  )
  @ApiParam({
    name: 'noteId',
    schema: {type: 'string'},
    description: 'The uuid of the jobApplicationNote.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          reporterComment: 'This is an updated comment.',
        },
      },
    },
  })
  async updateJobApplicationNote(
    @Param('noteId') noteId: string,
    @Body() body: Prisma.JobApplicationNoteUpdateInput
  ): Promise<JobApplicationNote> {
    return await this.jobApplicationNoteService.update({
      where: {id: parseInt(noteId)},
      data: body,
    });
  }

  //* Delete
  @Delete(':noteId')
  @RequirePermission(
    PermissionAction.delete,
    Prisma.ModelName.JobApplicationNote
  )
  @ApiParam({
    name: 'noteId',
    schema: {type: 'string'},
    description: 'The uuid of the jobApplicationNote.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async deleteJobApplicationNote(
    @Param('noteId') noteId: string
  ): Promise<JobApplicationNote> {
    return await this.jobApplicationNoteService.delete({
      where: {id: parseInt(noteId)},
    });
  }

  /* End */
}
