import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Request,
  BadRequestException,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {JobApplicationWorkflowNoteService} from './note.service';

import {
  JobApplicationWorkflowNote,
  PermissionAction,
  Prisma,
} from '@prisma/client';
import {RequirePermission} from '../../../../account/authorization/authorization.decorator';
import {UserService} from '../../../../account/user/user.service';
import {TokenService} from '../../../../../toolkit/token/token.service';
import {JobApplicationWorkflowService} from '../workflow.service';

@ApiTags('[Application] Recruitment / Job Application / Workflow Note')
@ApiBearerAuth()
@Controller('recruitment-workflow-notes')
export class JobApplicationWorkflowNoteController {
  private userService = new UserService();
  private tokenService = new TokenService();
  private jobApplicationWorkflowService = new JobApplicationWorkflowService();
  private jobApplicationWorkflowNoteService =
    new JobApplicationWorkflowNoteService();

  @Post('')
  @RequirePermission(
    PermissionAction.create,
    Prisma.ModelName.JobApplicationWorkflowNote
  )
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          reporterComment: 'This an example task.',
          workflowId: 'ababdab1-5d91-4af7-ab2b-e2c9744a88d4',
        },
      },
    },
  })
  async createJobApplicationWorkflowNote(
    @Request() request: Request,
    @Body()
    body: Prisma.JobApplicationWorkflowNoteUncheckedCreateInput
  ): Promise<JobApplicationWorkflowNote> {
    // [step 1] Guard statement.
    if (
      !(await this.jobApplicationWorkflowService.checkExistence(
        body.workflowId
      ))
    ) {
      throw new BadRequestException('Invalid workflowId in the request body.');
    }

    // [step 2] Get user.
    const {userId} = this.tokenService.decodeToken(
      this.tokenService.getTokenFromHttpRequest(request)
    ) as {userId: string};
    const user = await this.userService.findUniqueOrThrow({
      where: {id: userId},
    });
    body.reporterUserId = userId;
    body.reporter = user.username;

    // [step 3] Create jobApplicationWorkflowNote.
    return await this.jobApplicationWorkflowNoteService.create({data: body});
  }

  @Get('')
  @RequirePermission(
    PermissionAction.read,
    Prisma.ModelName.JobApplicationWorkflowNote
  )
  async getJobApplicationWorkflowNotes(): Promise<
    JobApplicationWorkflowNote[]
  > {
    return await this.jobApplicationWorkflowNoteService.findMany({});
  }

  @Get(':noteId')
  @RequirePermission(
    PermissionAction.read,
    Prisma.ModelName.JobApplicationWorkflowNote
  )
  @ApiParam({
    name: 'noteId',
    schema: {type: 'number'},
    description: 'The id of the jobApplicationWorkflowNote.',
    example: 1,
  })
  async getJobApplicationWorkflowNote(
    @Param('noteId') noteId: string
  ): Promise<JobApplicationWorkflowNote | null> {
    return await this.jobApplicationWorkflowNoteService.findUnique({
      where: {id: parseInt(noteId)},
    });
  }

  @Patch(':noteId')
  @RequirePermission(
    PermissionAction.update,
    Prisma.ModelName.JobApplicationWorkflowNote
  )
  @ApiParam({
    name: 'noteId',
    schema: {type: 'number'},
    description: 'The id of the jobApplicationWorkflowNote.',
    example: 1,
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
  async updateJobApplicationWorkflowNote(
    @Param('noteId') noteId: string,
    @Body() body: Prisma.JobApplicationWorkflowNoteUpdateInput
  ): Promise<JobApplicationWorkflowNote> {
    return await this.jobApplicationWorkflowNoteService.update({
      where: {id: parseInt(noteId)},
      data: body,
    });
  }

  @Delete(':noteId')
  @RequirePermission(
    PermissionAction.delete,
    Prisma.ModelName.JobApplicationWorkflowNote
  )
  @ApiParam({
    name: 'noteId',
    schema: {type: 'number'},
    description: 'The id of the jobApplicationWorkflowNote.',
    example: 1,
  })
  async deleteJobApplicationWorkflowNote(
    @Param('noteId') noteId: string
  ): Promise<JobApplicationWorkflowNote> {
    return await this.jobApplicationWorkflowNoteService.delete({
      where: {id: parseInt(noteId)},
    });
  }

  /* End */
}
