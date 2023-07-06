import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {PermissionAction, Prisma, CandidateProfile} from '@prisma/client';
import {RequirePermission} from '../../../account/authorization/authorization.decorator';
import {CandidateProfileService} from './profile.service';
import {generatePaginationParams} from '../../../../toolkit/pagination/pagination';

@ApiTags('[Application] Recruitment / Candidate / Profile')
@ApiBearerAuth()
@Controller('candidate-profiles')
export class CandidateProfileController {
  constructor(private candidateProfileService: CandidateProfileService) {}

  @Get('genders')
  listCandidateProfileGenders(): string[] {
    return ['Male', 'Female', 'Non-binary'];
  }

  @Post('')
  @RequirePermission(PermissionAction.Create, Prisma.ModelName.CandidateProfile)
  @ApiBody({
    description: 'Create a candidate profile.',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          candidateId: '924da395-1921-45fe-b7f5-1198ed78ac24',
          firstName: 'Mary',
          middleName: 'Rose',
          lastName: 'Johnson',
          dateOfBirth: new Date(),
          gender: 'Male',
          email: 'mary@hd.com',
          primaryPhone: '121289182',
          primaryPhoneExt: '232',
          alternatePhone: '7236782462',
          alternatePhoneExt: '897',
          websites: {facebook: 'https://www.facebook.com/grace'},
          picture:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg/800px-Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg',
        },
      },
    },
  })
  async createCandidateProfile(
    @Body() body: Prisma.CandidateProfileUncheckedCreateInput
  ): Promise<CandidateProfile> {
    return await this.candidateProfileService.create({data: body});
  }

  @Get('')
  @RequirePermission(PermissionAction.List, Prisma.ModelName.CandidateProfile)
  async getCandidateProfiles(
    @Query() query: {name?: string; page?: string; pageSize?: string}
  ): Promise<CandidateProfile[]> {
    // [step 1] Construct where argument.
    let where: Prisma.CandidateProfileWhereInput | undefined;
    if (query.name && query.name.trim().length > 0) {
      where = {
        fullName: {
          search: query.name
            .trim()
            .split(' ')
            .filter(word => word !== '')
            .join('|'),
        },
      };
    }

    // [step 2] Construct take and skip arguments.
    const {take, skip} = generatePaginationParams({
      page: query.page,
      pageSize: query.pageSize,
    });

    // [step 3] Get candidate profiles.
    return await this.candidateProfileService.findMany({
      where: where,
      take: take,
      skip: skip,
    });
  }

  @Get(':profileId')
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.CandidateProfile)
  @ApiParam({
    name: 'profileId',
    schema: {type: 'string'},
    description: 'The uuid of the profile.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  async getCandidateProfile(
    @Param('profileId') profileId: string
  ): Promise<CandidateProfile | null> {
    return await this.candidateProfileService.findUnique({
      where: {id: profileId},
    });
  }

  @Patch(':profileId')
  @RequirePermission(PermissionAction.Update, Prisma.ModelName.CandidateProfile)
  @ApiParam({
    name: 'profileId',
    schema: {type: 'string'},
    description: 'The uuid of the profile.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  @ApiBody({
    description: 'Update a specific candidate profile.',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          firstName: 'Robert',
          middleName: 'William',
          lastName: 'Smith',
          dateOfBirth: '2019-05-27',
          gender: 'Male',
          emails: [{email: 'mary@hd.com'}],
          phones: [
            {phone: '121289182', extention: '232'},
            {phone: '7236782462', extention: '897'},
          ],
          websites: {facebook: 'https://www.facebook.com/grace'},
          picture:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg/800px-Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg',
        },
      },
    },
  })
  async updateCandidateProfile(
    @Param('profileId') profileId: string,
    @Body() body: Prisma.CandidateProfileUpdateInput
  ): Promise<CandidateProfile> {
    return await this.candidateProfileService.update({
      where: {id: profileId},
      data: body,
    });
  }

  @Delete(':profileId')
  @RequirePermission(PermissionAction.Delete, Prisma.ModelName.CandidateProfile)
  @ApiParam({
    name: 'profileId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  async deleteCandidateProfile(
    @Param('profileId') profileId: string
  ): Promise<CandidateProfile> {
    return await this.candidateProfileService.delete({
      where: {id: profileId},
    });
  }

  /* End */
}
