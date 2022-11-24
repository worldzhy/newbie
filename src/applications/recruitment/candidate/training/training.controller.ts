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
import {CandidateTrainingService} from './training.service';
import {CandidateTraining, PermissionAction, Prisma} from '@prisma/client';
import {CandidateService} from '../candidate.service';
import {RequirePermission} from '../../../account/authorization/authorization.decorator';

@ApiTags('[Application] Recruitment / Candidate / Training')
@ApiBearerAuth()
@Controller('recruitment-candidate-trainings')
export class CandidateTrainingController {
  private candidateTrainingService = new CandidateTrainingService();
  private candidateService = new CandidateService();

  //* Create
  @Post('')
  @RequirePermission(
    PermissionAction.create,
    Prisma.ModelName.CandidateTraining
  )
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'Training',
          candidateId: 'e58e87c6-94b5-4da8-91d7-8373b029c12e',
        },
      },
    },
  })
  async createCandidateTraining(
    @Body()
    body: Prisma.CandidateTrainingUncheckedCreateInput
  ): Promise<CandidateTraining> {
    // [step 1] Guard statement.
    if (!(await this.candidateService.checkExistence(body.candidateId))) {
      throw new BadRequestException('Invalid candidateId in the request body.');
    }

    // [step 2] Create candidateTraining.
    return await this.candidateTrainingService.create({data: body});
  }

  //* Get many
  @Get('')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.CandidateTraining)
  async getCandidateTrainings(): Promise<CandidateTraining[]> {
    return await this.candidateTrainingService.findMany({});
  }

  //* Get
  @Get(':trainingId')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.CandidateTraining)
  @ApiParam({
    name: 'trainingId',
    schema: {type: 'string'},
    description: 'The id of the candidateTraining.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getCandidateTraining(
    @Param('trainingId') trainingId: string
  ): Promise<CandidateTraining | null> {
    return await this.candidateTrainingService.findUnique({
      where: {id: parseInt(trainingId)},
    });
  }

  //* Update
  @Patch(':trainingId')
  @RequirePermission(
    PermissionAction.update,
    Prisma.ModelName.CandidateTraining
  )
  @ApiParam({
    name: 'trainingId',
    schema: {type: 'string'},
    description: 'The id of the candidateTraining.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          description: 'This is an updated description.',
        },
      },
    },
  })
  async updateCandidateTraining(
    @Param('trainingId') trainingId: string,
    @Body() body: Prisma.CandidateTrainingUpdateInput
  ): Promise<CandidateTraining> {
    return await this.candidateTrainingService.update({
      where: {id: parseInt(trainingId)},
      data: body,
    });
  }

  //* Delete
  @Delete(':trainingId')
  @RequirePermission(
    PermissionAction.delete,
    Prisma.ModelName.CandidateTraining
  )
  @ApiParam({
    name: 'trainingId',
    schema: {type: 'string'},
    description: 'The id of the candidateTraining.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async deleteCandidateTraining(
    @Param('trainingId') trainingId: string
  ): Promise<CandidateTraining> {
    return await this.candidateTrainingService.delete({
      where: {id: parseInt(trainingId)},
    });
  }

  /* End */
}
