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
import {
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import {Prisma, Candidate, PermissionAction} from '@prisma/client';
import {generateRandomNumbers} from '../../../toolkit/utilities/common.util';
import {RequirePermission} from '../../account/authorization/authorization.decorator';
import {CandidateService} from './candidate.service';
import {generatePaginationParams} from '../../../toolkit/pagination/pagination';

@ApiTags('[Application] Recruitment / Candidate')
@ApiBearerAuth()
@Controller('recruitment-candidates')
export class CandidateController {
  constructor(private candidateService: CandidateService) {}

  @Post('')
  @RequirePermission(PermissionAction.Create, Prisma.ModelName.Candidate)
  @ApiBody({
    description: 'Create a user candidate.',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          firstName: 'Mary',
          middleName: 'Rose',
          lastName: 'Johnson',
          dateOfBirth: new Date(),
          gender: 'Female',
          email: 'mary@hd.com',
          primaryPhone: '121289182',
          primaryPhoneExt: '232',
          alternatePhone: '7236782462',
          alternatePhoneExt: '897',
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
    body: Prisma.LocationCreateInput &
      Prisma.CandidateProfileCreateWithoutCandidateInput
  ): Promise<Candidate> {
    const profileCreateInput: Prisma.CandidateProfileCreateWithoutCandidateInput =
      {
        uniqueNumber: generateRandomNumbers(9),
        firstName: body.firstName,
        middleName: body.middleName,
        lastName: body.lastName,
        dateOfBirth: body.dateOfBirth,
        gender: body.gender,
        email: body.email,
        primaryPhone: body.primaryPhone,
        primaryPhoneExt: body.primaryPhoneExt,
        alternatePhone: body.alternatePhone,
        alternatePhoneExt: body.alternatePhoneExt,
      };

    return await this.candidateService.create({
      data: {
        profile: {create: profileCreateInput},
      },
    });
  }

  @Get('count')
  @RequirePermission(PermissionAction.List, Prisma.ModelName.Candidate)
  @ApiQuery({name: 'name', type: 'string'})
  @ApiQuery({name: 'email', type: 'string'})
  @ApiQuery({name: 'phone', type: 'string'})
  async countCandidates(
    @Query() query: {name?: string; email?: string; phone?: string}
  ): Promise<number> {
    // [step 1] Construct where argument.
    let where: Prisma.CandidateWhereInput | undefined;
    const whereConditions: object[] = [];
    if (query.name && query.name.trim().length > 0) {
      whereConditions.push({
        profile: {
          fullName: {
            search: query.name
              .trim()
              .split(' ')
              .filter(word => word !== '')
              .join('|'),
          },
        },
      });
    }
    if (query.email && query.email.trim().length > 0) {
      whereConditions.push({
        profile: {email: {contains: query.email.trim()}},
      });
    }
    if (query.phone && query.phone.trim().length > 0) {
      whereConditions.push({
        profile: {primaryPhone: {contains: query.phone.trim()}},
      });
      whereConditions.push({
        profile: {alternatePhone: {contains: query.phone.trim()}},
      });
    }

    if (whereConditions.length > 0) {
      where = {OR: whereConditions};
    }

    // [step 2] Count.
    return await this.candidateService.count({
      where: where,
    });
  }

  @Get('')
  @RequirePermission(PermissionAction.List, Prisma.ModelName.Candidate)
  @ApiQuery({name: 'name', type: 'string'})
  @ApiQuery({name: 'email', type: 'string'})
  @ApiQuery({name: 'phone', type: 'string'})
  @ApiQuery({name: 'page', type: 'number'})
  @ApiQuery({name: 'pageSize', type: 'number'})
  async getCandidates(
    @Query()
    query: {
      name?: string;
      email?: string;
      phone?: string;
      page?: string;
      pageSize?: string;
    }
  ): Promise<Candidate[]> {
    // [step 1] Construct where argument.
    let where: Prisma.CandidateWhereInput | undefined;
    const whereConditions: object[] = [];
    if (query.name && query.name.trim().length > 0) {
      whereConditions.push({
        profile: {
          fullName: {
            search: query.name
              .trim()
              .split(' ')
              .filter(word => word !== '')
              .join('|'),
          },
        },
      });
    }
    if (query.email && query.email.trim().length > 0) {
      whereConditions.push({
        profile: {email: {contains: query.email.trim()}},
      });
    }
    if (query.phone && query.phone.trim().length > 0) {
      whereConditions.push({
        profile: {primaryPhone: {contains: query.phone.trim()}},
      });
      whereConditions.push({
        profile: {alternatePhone: {contains: query.phone.trim()}},
      });
    }

    if (whereConditions.length > 0) {
      where = {OR: whereConditions};
    }

    // [step 2] Construct take and skip arguments.
    const {take, skip} = generatePaginationParams({
      page: query.page,
      pageSize: query.pageSize,
    });

    // [step 3] Get candidates.
    const candidates = await this.candidateService.findMany({
      where: where,
      orderBy: {updatedAt: 'desc'},
      take: take,
      skip: skip,
      include: {
        profile: true,
        jobApplications: {
          take: 1,
          skip: 0,
          orderBy: {createdAt: 'desc'},
          include: {
            workflows: {
              include: {
                payload: true,
              },
            },
          },
        },
      },
    });

    return candidates.map(candidate => {
      const location = candidate['location'];
      const profile = candidate['profile'];
      delete candidate['location'];
      delete candidate['profile'];
      delete location.id;
      delete location.candidateId;
      delete profile.id;
      delete profile.candidateId;

      return {
        ...candidate,
        ...location,
        ...profile,
      };
    });
  }

  @Get(':candidateId')
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.Candidate)
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
      include: {profile: true},
    });
    const location = candidate['location'];
    const profile = candidate['profile'];
    delete candidate['location'];
    delete candidate['profile'];
    delete location.id;
    delete location.candidateId;
    delete profile.id;
    delete profile.candidateId;

    return {
      ...candidate,
      ...location,
      ...profile,
    };
  }

  @Patch(':candidateId')
  @RequirePermission(PermissionAction.Update, Prisma.ModelName.Candidate)
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
          firstName: 'Robert',
          middleName: 'William',
          lastName: 'Smith',
          dateOfBirth: new Date(),
          gender: 'Female',
          email: 'mary@hd.com',
          primaryPhone: '121289182',
          primaryPhoneExt: '232',
          alternatePhone: '7236782462',
          alternatePhoneExt: '897',
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
    body: Prisma.LocationUpdateInput &
      Prisma.CandidateProfileUpdateWithoutCandidateInput
  ): Promise<Candidate> {
    return await this.candidateService.update({
      where: {id: candidateId},
      data: {
        profile: {
          update: {
            firstName: body.firstName,
            middleName: body.middleName,
            lastName: body.lastName,
            dateOfBirth: body.dateOfBirth,
            gender: body.gender,
            email: body.email,
            primaryPhone: body.primaryPhone,
            primaryPhoneExt: body.primaryPhoneExt,
            alternatePhone: body.alternatePhone,
            alternatePhoneExt: body.alternatePhoneExt,
          },
        },
      },
    });
  }

  @Delete(':candidateId')
  @RequirePermission(PermissionAction.Delete, Prisma.ModelName.Candidate)
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
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.Candidate)
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
      include: {
        jobApplications: {
          include: {
            workflows: {
              orderBy: {createdAt: 'desc'},
              include: {
                payload: true,
                trails: {orderBy: {createdAt: 'desc'}},
              },
            },
          },
        },
      },
    });
  }

  /* End */
}
