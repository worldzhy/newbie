import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import {
  Prisma,
  Candidate,
  PermissionAction,
  CandidateProfileGender,
} from '@prisma/client';
import {randomCode} from 'src/toolkits/utilities/common.util';
import {RequirePermission} from '../../account/authorization/authorization.decorator';
import {CandidateService} from './candidate.service';

@ApiTags('[Application] Recruitment / Candidate')
@ApiBearerAuth()
@Controller('recruitment-candidates')
export class CandidateController {
  constructor(private candidateService: CandidateService) {}

  @Get('count')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.Candidate)
  @ApiQuery({name: 'name', type: 'string'})
  async countCandidates(@Query() query: {name?: string}): Promise<number> {
    // [step 1] Construct where argument.
    let where: Prisma.CandidateWhereInput | undefined;
    const whereConditions: object[] = [];
    if (query.name) {
      const name = query.name.trim();
      if (name.length > 0) {
        whereConditions.push({givenName: {search: name}});
        whereConditions.push({familyName: {search: name}});
        whereConditions.push({middleName: {search: name}});
      }
    }

    if (whereConditions.length > 0) {
      where = {OR: whereConditions};
    }

    // [step 2] Count.
    return await this.candidateService.count({
      where: where,
    });
  }

  @Post('')
  @RequirePermission(PermissionAction.create, Prisma.ModelName.Candidate)
  @ApiBody({
    description: 'Create a user candidate.',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          givenName: 'Mary',
          middleName: 'Rose',
          familyName: 'Johnson',
          birthday: new Date(),
          gender: CandidateProfileGender.FEMALE,
          emails: [{email: 'mary@hd.com'}],
          phones: [
            {phone: '121289182', extention: '232'},
            {phone: '7236782462', extention: '897'},
          ],
          address: '456 White Finch St. North Augusta, SC 29860',
          address2: '',
          city: 'New York City',
          state: 'NY',
          zipcode: '21000',
        },
      },
    },
  })
  async createCandidate(
    @Body()
    body: Prisma.CandidateLocationCreateWithoutCandidateInput &
      Prisma.CandidateProfileCreateWithoutCandidateInput
  ): Promise<Candidate> {
    return await this.candidateService.create({
      data: {
        location: {
          create: {
            address: body.address,
            address2: body.address2,
            city: body.city,
            state: body.state,
            zipcode: body.zipcode,
          },
        },
        profile: {
          create: {
            uniqueNumber: randomCode(9),
            givenName: body.givenName,
            middleName: body.middleName,
            familyName: body.familyName,
            birthday: body.birthday,
            gender: body.gender,
            emails: body.emails,
            phones: body.phones,
          },
        },
      },
    });
  }

  @Get('')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.Candidate)
  @ApiQuery({name: 'name', type: 'string'})
  @ApiQuery({name: 'page', type: 'number'})
  @ApiQuery({name: 'pageSize', type: 'number'})
  async getCandidates(
    @Query() query: {name?: string; page?: string; pageSize?: string}
  ): Promise<Candidate[]> {
    // [step 1] Construct where argument.
    let where: Prisma.CandidateWhereInput | undefined;
    const whereConditions: object[] = [];
    if (query.name) {
      const name = query.name.trim();
      if (name.length > 0) {
        whereConditions.push({givenName: {search: name}});
        whereConditions.push({familyName: {search: name}});
        whereConditions.push({middleName: {search: name}});
      }
    }

    if (whereConditions.length > 0) {
      where = {OR: whereConditions};
    }

    // [step 2] Construct take and skip arguments.
    let take: number, skip: number;
    if (query.page && query.pageSize) {
      // Actually 'page' is string because it comes from URL param.
      const page = parseInt(query.page);
      const pageSize = parseInt(query.pageSize);
      if (page > 0) {
        take = pageSize;
        skip = pageSize * (page - 1);
      } else {
        throw new BadRequestException(
          'The page and pageSize must be larger than 0.'
        );
      }
    } else {
      take = 10;
      skip = 0;
    }

    // [step 3] Get candidates.
    const candidates = await this.candidateService.findMany({
      where: where,
      take: take,
      skip: skip,
      include: {location: true, profile: true, jobApplications: true},
    });

    return candidates.map(candidate => {
      const location = candidate['location'];
      const profile = candidate['profile'];
      delete candidate['location'];
      delete candidate['profile'];
      return {
        ...candidate,
        ...location,
        ...profile,
      };
    });
  }

  @Get(':candidateId')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.Candidate)
  @ApiParam({
    name: 'candidateId',
    schema: {type: 'string'},
    description: 'The uuid of the candidate.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  async getCandidate(
    @Param('candidateId') candidateId: string
  ): Promise<Candidate | null> {
    const candidate = await this.candidateService.findUniqueOrThrow({
      where: {id: candidateId},
      include: {location: true, profile: true},
    });
    const location = candidate['location'];
    const profile = candidate['profile'];
    delete candidate['location'];
    delete candidate['profile'];

    return {
      ...candidate,
      ...location,
      ...profile,
    };
  }

  @Patch(':candidateId')
  @RequirePermission(PermissionAction.update, Prisma.ModelName.Candidate)
  @ApiParam({
    name: 'candidateId',
    schema: {type: 'string'},
    description: 'The uuid of the candidate.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  @ApiBody({
    description: 'Update a specific user candidate.',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          givenName: 'Robert',
          middleName: 'William',
          familyName: 'Smith',
          birthday: new Date(),
          gender: CandidateProfileGender.FEMALE,
          emails: [{email: 'mary@hd.com'}],
          phones: [
            {phone: '6786786786', extention: '222'},
            {phone: '7897987111', extention: '111'},
          ],
          address: '456 White Finch St. North Augusta, SC 29860',
          address2: '',
          city: 'New York City',
          state: 'NY',
          zipcode: '21000',
        },
      },
    },
  })
  async updateCandidate(
    @Param('candidateId') candidateId: string,
    @Body()
    body: Prisma.CandidateLocationUpdateWithoutCandidateInput &
      Prisma.CandidateProfileUpdateWithoutCandidateInput
  ): Promise<Candidate> {
    return await this.candidateService.update({
      where: {id: candidateId},
      data: {
        location: {
          update: {
            address: body.address,
            address2: body.address2,
            city: body.city,
            state: body.state,
            zipcode: body.zipcode,
          },
        },
        profile: {
          update: {
            givenName: body.givenName,
            middleName: body.middleName,
            familyName: body.familyName,
            birthday: body.birthday,
            gender: body.gender,
            emails: body.emails,
            phones: body.phones,
          },
        },
      },
    });
  }

  @Delete(':candidateId')
  @RequirePermission(PermissionAction.delete, Prisma.ModelName.Candidate)
  @ApiParam({
    name: 'candidateId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  async deleteUser(
    @Param('candidateId') candidateId: string
  ): Promise<Candidate> {
    return await this.candidateService.delete({
      where: {id: candidateId},
    });
  }

  @Get(':candidateId/job-applications')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.Candidate)
  @ApiParam({
    name: 'candidateId',
    schema: {type: 'string'},
    description: 'The uuid of the candidate.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  async getCandidateJobApplications(
    @Param('candidateId') candidateId: string
  ): Promise<Candidate> {
    return await this.candidateService.findUniqueOrThrow({
      where: {id: candidateId},
      include: {jobApplications: true},
    });
  }

  @Get('genders')
  listCandidateProfileGenders(): string[] {
    return Object.keys(CandidateProfileGender);
  }

  /* End */
}
