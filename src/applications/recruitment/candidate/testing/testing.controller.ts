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
  PermissionAction,
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

  @Get('types')
  listCandidateTestingTypes(): string[] {
    return [
      'York-All Jobs',
      'Tomahawk Production Technician',
      'Harley-Davidson York Weld',
      'PTO PT',
      'York Skilled Trade',
      'Harley-Davidson PTO Millwright',
      'Harley-Davidson PDC',
      'Harley-Davidson PTO Maintenance/Mechanic',
      'Harley-Davidson PTO Tool Room',
      'Harley-Davidson PTO Maintenance Electric',
      'salary',
      'Harley-Davidson THK PTK Maintenance',
    ];
  }

  @Get('locations')
  listCandidateTestingLocations(): string[] {
    return [
      'Harley Davidson Lifestyle Centers',
      'Concentra Medical Centers',
      'Wilmington Medical Center',
      'Lakeway Urgent Care',
      'Halifax Health ExpressCare',
      'Brookwood Occupational Health',
      'Frederick Health Employer Solutions',
      'UnityPoint',
      'Access Medical Center',
      'DCH Regional',
      'MedExpress',
      'Asante Occupational Health',
      'CoxHealth Occupational Medicine',
      'Drug Screen Compliance',
      'Mercyhealth Occupational Health & Wellness',
      'Advance Medical of Naples, LLC',
      'Labcorp',
      'Nao Medical/Statcare Urgent & Walk',
      'Cascade Occupational Health',
      'Integra Discovery Services',
      'Med Central Health Resource',
      'Mercy Iowa City Occupational Health',
      'Landmark Medical Center',
      'Safeworks, IL',
      'GulfMed Walk',
      'Reliant Medical Group',
      'Mayo Clinic',
      'Cedars Health',
      'KRMC Occupational and Employee Health',
      'Next Level Urgent Care',
      'Sycamore Avenue Medical Center',
      'OSF Occupational Health',
      'Northwell Great Neck, NY (Long Island)',
      'White',
      'Eastern Medical',
      'Select Physical Therapy',
      'KRMC Occ Health',
    ];
  }

  //* Create
  @Post('')
  @RequirePermission(PermissionAction.create, Prisma.ModelName.CandidateTesting)
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          type: 'York Skilled Trade',
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
  @RequirePermission(PermissionAction.read, Prisma.ModelName.CandidateTesting)
  async getCandidateTestings(): Promise<CandidateTesting[]> {
    return await this.candidateTestingService.findMany({});
  }

  //* Get
  @Get(':testingId')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.CandidateTesting)
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
  @RequirePermission(PermissionAction.update, Prisma.ModelName.CandidateTesting)
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
  @RequirePermission(PermissionAction.delete, Prisma.ModelName.CandidateTesting)
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
