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
import {CandidateTestingService} from './testing.service';

import {
  CandidateTesting,
  CandidateTestingState,
  CandidateTestingType,
  PermissionAction,
  PermissionResource,
  Prisma,
} from '@prisma/client';
import {CandidateService} from '../candidate.service';
import {RequirePermission} from '../../../account/authorization/authorization.decorator';

@ApiTags('[Application] Recruitment / Candidate / Testing')
@ApiBearerAuth()
@Controller('recruitment-candidate-testings')
export class CandidateTestingController {
  private candidateTestingService = new CandidateTestingService();
  private candidateService = new CandidateService();

  //* Create
  @Post('')
  @RequirePermission(
    PermissionResource.CandidateTesting,
    PermissionAction.CREATE
  )
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          type: CandidateTestingType.POET,
          candidateId: 'ababdab1-5d91-4af7-ab2b-e2c9744a88d4',
        },
      },
    },
  })
  async createCandidateTesting(
    @Body()
    body: Prisma.CandidateTestingUncheckedCreateInput
  ): Promise<CandidateTesting> {
    // [step 1] Guard statement.
    if (!(await this.candidateService.checkExistence(body.candidateId))) {
      throw new BadRequestException('Invalid candidateId in the request body.');
    }

    // [step 2] Create candidateTesting.
    return await this.candidateTestingService.create({data: body});
  }

  //* Get many
  @Get('')
  @RequirePermission(
    PermissionResource.CandidateTesting,
    PermissionAction.SELECT
  )
  async getCandidateTestings(): Promise<CandidateTesting[]> {
    return await this.candidateTestingService.findMany({});
  }

  //* Get
  @Get(':testingId')
  @RequirePermission(
    PermissionResource.CandidateTesting,
    PermissionAction.SELECT
  )
  @ApiParam({
    name: 'testingId',
    schema: {type: 'string'},
    description: 'The id of the candidateTesting.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getCandidateTesting(
    @Param('testingId') testingId: string
  ): Promise<CandidateTesting | null> {
    return await this.candidateTestingService.findUnique({
      where: {id: parseInt(testingId)},
    });
  }

  //* Update
  @Patch(':testingId')
  @RequirePermission(
    PermissionResource.CandidateTesting,
    PermissionAction.UPDATE
  )
  @ApiParam({
    name: 'testingId',
    schema: {type: 'string'},
    description: 'The id of the candidateTesting.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          reviewCode: CandidateTestingState.PASSED,
        },
      },
    },
  })
  async updateCandidateTesting(
    @Param('testingId') testingId: string,
    @Body() body: Prisma.CandidateTestingUpdateInput
  ): Promise<CandidateTesting> {
    return await this.candidateTestingService.update({
      where: {id: parseInt(testingId)},
      data: body,
    });
  }

  //* Delete
  @Delete(':testingId')
  @RequirePermission(
    PermissionResource.CandidateTesting,
    PermissionAction.DELETE
  )
  @ApiParam({
    name: 'testingId',
    schema: {type: 'string'},
    description: 'The id of the candidateTesting.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async deleteCandidateTesting(
    @Param('testingId') testingId: string
  ): Promise<CandidateTesting> {
    return await this.candidateTestingService.delete({
      where: {id: parseInt(testingId)},
    });
  }

  /* End */
}
