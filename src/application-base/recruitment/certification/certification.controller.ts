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
import {CertificationService} from './certification.service';

import {Certification, PermissionAction, Prisma} from '@prisma/client';
import {RequirePermission} from '@microservices/account/security/authorization/authorization.decorator';
import {UserService} from '@microservices/account/user/user.service';

@ApiTags('Recruitment / Candidate / Certification')
@ApiBearerAuth()
@Controller('recruitment-candidate-certifications')
export class CertificationController {
  constructor(
    private readonly candidateCertificationService: CertificationService,
    private readonly userService: UserService
  ) {}

  //* Create
  @Post('')
  @RequirePermission(PermissionAction.Create, Prisma.ModelName.Certification)
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'XCertification',
          candidateUserId: 'e58e87c6-94b5-4da8-91d7-8373b029c12e',
        },
      },
    },
  })
  async createCertification(
    @Body()
    body: Prisma.CertificationUncheckedCreateInput
  ): Promise<Certification> {
    // [step 1] Guard statement.
    if (!(await this.userService.checkExistence(body.candidateUserId))) {
      throw new BadRequestException('Invalid candidateId in the request body.');
    }

    // [step 2] Create candidateCertification.
    return await this.candidateCertificationService.create({data: body});
  }

  //* Get many
  @Get('')
  @RequirePermission(PermissionAction.List, Prisma.ModelName.Certification)
  async getCertifications(): Promise<Certification[]> {
    return await this.candidateCertificationService.findMany({});
  }

  //* Get
  @Get(':certificationId')
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.Certification)
  async getCertification(
    @Param('certificationId') certificationId: number
  ): Promise<Certification | null> {
    return await this.candidateCertificationService.findUnique({
      where: {id: certificationId},
    });
  }

  //* Update
  @Patch(':certificationId')
  @RequirePermission(PermissionAction.Update, Prisma.ModelName.Certification)
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
  async updateCertification(
    @Param('certificationId') certificationId: number,
    @Body() body: Prisma.CertificationUpdateInput
  ): Promise<Certification> {
    return await this.candidateCertificationService.update({
      where: {id: certificationId},
      data: body,
    });
  }

  //* Delete
  @Delete(':certificationId')
  @RequirePermission(PermissionAction.Delete, Prisma.ModelName.Certification)
  async deleteCertification(
    @Param('certificationId') certificationId: number
  ): Promise<Certification> {
    return await this.candidateCertificationService.delete({
      where: {id: certificationId},
    });
  }

  /* End */
}
