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
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {CandidateCertificationService} from './certification.service';

import {CandidateCertification, PermissionAction, Prisma} from '@prisma/client';
import {CandidateService} from '../candidate.service';
import {RequirePermission} from '@microservices/account/security/authorization/authorization.decorator';

@ApiTags('Recruitment / Candidate / Certification')
@ApiBearerAuth()
@Controller('recruitment-candidate-certifications')
export class CandidateCertificationController {
  constructor(
    private readonly candidateCertificationService: CandidateCertificationService,
    private readonly candidateService: CandidateService
  ) {}

  //* Create
  @Post('')
  @RequirePermission(
    PermissionAction.Create,
    Prisma.ModelName.CandidateCertification
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
    PermissionAction.List,
    Prisma.ModelName.CandidateCertification
  )
  async getCandidateCertifications(): Promise<CandidateCertification[]> {
    return await this.candidateCertificationService.findMany({});
  }

  //* Get
  @Get(':certificationId')
  @RequirePermission(
    PermissionAction.Get,
    Prisma.ModelName.CandidateCertification
  )
  async getCandidateCertification(
    @Param('certificationId') certificationId: number
  ): Promise<CandidateCertification | null> {
    return await this.candidateCertificationService.findUnique({
      where: {id: certificationId},
    });
  }

  //* Update
  @Patch(':certificationId')
  @RequirePermission(
    PermissionAction.Update,
    Prisma.ModelName.CandidateCertification
  )
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
    @Param('certificationId') certificationId: number,
    @Body() body: Prisma.CandidateCertificationUpdateInput
  ): Promise<CandidateCertification> {
    return await this.candidateCertificationService.update({
      where: {id: certificationId},
      data: body,
    });
  }

  //* Delete
  @Delete(':certificationId')
  @RequirePermission(
    PermissionAction.Delete,
    Prisma.ModelName.CandidateCertification
  )
  async deleteCandidateCertification(
    @Param('certificationId') certificationId: number
  ): Promise<CandidateCertification> {
    return await this.candidateCertificationService.delete({
      where: {id: certificationId},
    });
  }

  /* End */
}
