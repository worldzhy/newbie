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
import {CandidateCertificationService} from './certification.service';

import {
  CandidateCertification,
  PermissionAction,
  PermissionResource,
  Prisma,
} from '@prisma/client';
import {CandidateService} from '../candidate.service';
import {RequirePermission} from '../../../account/authorization/authorization.decorator';

@ApiTags('[Application] Recruitment / Candidate / Certification')
@ApiBearerAuth()
@Controller('recruitment-candidate-certifications')
export class CandidateCertificationController {
  private candidateCertificationService = new CandidateCertificationService();
  private candidateService = new CandidateService();

  //* Create
  @Post('')
  @RequirePermission(
    PermissionResource.CandidateCertification,
    PermissionAction.CREATE
  )
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'XCertification',
          candidateId: 'e58e87c6-94b5-4da8-91d7-8373b029c12e',
        },
      },
    },
  })
  async createCandidateCertification(
    @Body()
    body: Prisma.CandidateCertificationUncheckedCreateInput
  ): Promise<CandidateCertification> {
    // [step 1] Guard statement.
    if (!(await this.candidateService.checkExistence(body.candidateId))) {
      throw new BadRequestException('Invalid candidateId in the request body.');
    }

    // [step 2] Create candidateCertification.
    return await this.candidateCertificationService.create({data: body});
  }

  //* Get many
  @Get('')
  @RequirePermission(
    PermissionResource.CandidateCertification,
    PermissionAction.SELECT
  )
  async getCandidateCertifications(): Promise<CandidateCertification[]> {
    return await this.candidateCertificationService.findMany({});
  }

  //* Get
  @Get(':certificationId')
  @RequirePermission(
    PermissionResource.CandidateCertification,
    PermissionAction.SELECT
  )
  @ApiParam({
    name: 'certificationId',
    schema: {type: 'string'},
    description: 'The id of the candidateCertification.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getCandidateCertification(
    @Param('certificationId') certificationId: string
  ): Promise<CandidateCertification | null> {
    return await this.candidateCertificationService.findUnique({
      where: {id: parseInt(certificationId)},
    });
  }

  //* Update
  @Patch(':certificationId')
  @RequirePermission(
    PermissionResource.CandidateCertification,
    PermissionAction.UPDATE
  )
  @ApiParam({
    name: 'certificationId',
    schema: {type: 'string'},
    description: 'The id of the candidateCertification.',
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
  async updateCandidateCertification(
    @Param('certificationId') certificationId: string,
    @Body() body: Prisma.CandidateCertificationUpdateInput
  ): Promise<CandidateCertification> {
    return await this.candidateCertificationService.update({
      where: {id: parseInt(certificationId)},
      data: body,
    });
  }

  //* Delete
  @Delete(':certificationId')
  @RequirePermission(
    PermissionResource.CandidateCertification,
    PermissionAction.DELETE
  )
  @ApiParam({
    name: 'certificationId',
    schema: {type: 'string'},
    description: 'The id of the candidateCertification.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async deleteCandidateCertification(
    @Param('certificationId') certificationId: string
  ): Promise<CandidateCertification> {
    return await this.candidateCertificationService.delete({
      where: {id: parseInt(certificationId)},
    });
  }

  /* End */
}
