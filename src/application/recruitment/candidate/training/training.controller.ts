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
  constructor(
    private readonly candidateTrainingService: CandidateTrainingService,
    private readonly candidateService: CandidateService
  ) {}

  @Post('')
  @RequirePermission(
    PermissionAction.Create,
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

  @Get('')
  @RequirePermission(PermissionAction.List, Prisma.ModelName.CandidateTraining)
  async getCandidateTrainings(): Promise<CandidateTraining[]> {
    return await this.candidateTrainingService.findMany({});
  }

  @Get(':trainingId')
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.CandidateTraining)
  @ApiParam({
    name: 'trainingId',
    schema: {type: 'number'},
    description: 'The id of the candidateTraining.',
    example: 1,
  })
  async getCandidateTraining(
    @Param('trainingId') trainingId: number
  ): Promise<CandidateTraining | null> {
    return await this.candidateTrainingService.findUnique({
      where: {id: trainingId},
    });
  }

  @Patch(':trainingId')
  @RequirePermission(
    PermissionAction.Update,
    Prisma.ModelName.CandidateTraining
  )
  @ApiParam({
    name: 'trainingId',
    schema: {type: 'number'},
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
    @Param('trainingId') trainingId: number,
    @Body() body: Prisma.CandidateTrainingUpdateInput
  ): Promise<CandidateTraining> {
    return await this.candidateTrainingService.update({
      where: {id: trainingId},
      data: body,
    });
  }

  @Delete(':trainingId')
  @RequirePermission(
    PermissionAction.Delete,
    Prisma.ModelName.CandidateTraining
  )
  @ApiParam({
    name: 'trainingId',
    schema: {type: 'number'},
    description: 'The id of the candidateTraining.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async deleteCandidateTraining(
    @Param('trainingId') trainingId: number
  ): Promise<CandidateTraining> {
    return await this.candidateTrainingService.delete({
      where: {id: trainingId},
    });
  }

  /* End */
}
