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
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import {Prisma, Candidate, PermissionAction} from '@prisma/client';

import * as moment from 'moment';
import {RequirePermission} from '@microservices/account/security/authorization/authorization.decorator';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {Request} from 'express';
import {AccountService} from '@microservices/account/account.service';
import {generateRandomNumbers} from '@toolkit/utilities/common.util';

@ApiTags('[Application] Recruitment / Candidate')
@ApiBearerAuth()
@Controller('recruitment-candidates')
export class CandidateController {
  constructor(
    private prisma: PrismaService,
    private accountService: AccountService
  ) {}

  @Post('')
  @RequirePermission(PermissionAction.Create, Prisma.ModelName.Candidate)
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
    @Req() request: Request,
    @Body()
    body: Prisma.PlaceCreateInput &
      Prisma.CandidateProfileCreateWithoutCandidateInput
  ): Promise<Candidate> {
    const user = await this.accountService.me(request);
    const locationCreateInput: Prisma.PlaceCreateInput = {
      address: body.address,
      address2: body.address2,
      city: body.city,
      state: body.state,
      zipCode: body.zipCode,
    };
    const profileCreateInput: Prisma.CandidateProfileCreateWithoutCandidateInput =
      {
        uniqueNumber: generateRandomNumbers(9),
        givenName: body.givenName,
        middleName: body.middleName,
        familyName: body.familyName,
        birthday: body.birthday,
        gender: body.gender,
        email: body.email,
        primaryPhone: body.primaryPhone,
        primaryPhoneExt: body.primaryPhoneExt,
        alternatePhone: body.alternatePhone,
        alternatePhoneExt: body.alternatePhoneExt,
      };

    await this.prisma.place.create({data: locationCreateInput});
    return await this.prisma.candidate.create({
      data: {
        profile: {create: profileCreateInput},
        organizationId: user.organization?.id,
      },
    });
  }

  @Get('count')
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.Candidate)
  @ApiQuery({name: 'name', type: 'string'})
  @ApiQuery({name: 'email', type: 'string'})
  @ApiQuery({name: 'phone', type: 'string'})
  @ApiQuery({name: 'jobApplications', type: 'string'})
  @ApiQuery({name: 'createdAt', type: 'string', isArray: true})
  @ApiQuery({name: 'updatedAt', type: 'string', isArray: true})
  async countCandidates(
    @Req() request: Request,
    @Query()
    query: {
      name?: string;
      email?: string;
      phone?: string;
      jobApplications?: string;
      createdAt: string[];
      updatedAt: string[];
    }
  ): Promise<number> {
    // [step 1] Construct where argument.
    let where: Prisma.CandidateWhereInput | undefined;
    const whereConditions: object[] = [];
    const user = await this.accountService.me(request);
    if (user.organization) {
      whereConditions.push({organizationId: user.organization.id});
    }
    if (query.name && query.name.trim().length > 0) {
      whereConditions.push({
        profile: {
          fullName: {
            contains: query.name.trim(),
            mode: 'insensitive',
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
        profile: {
          OR: [
            {
              primaryPhone: {contains: query.phone.trim()},
            },
            {
              alternatePhone: {contains: query.phone.trim()},
            },
          ],
        },
      });
    }

    if (query.jobApplications) {
      const jobApplicationsParams: Prisma.JobApplicationWhereInput = JSON.parse(
        query.jobApplications
      );
      if (jobApplicationsParams.workflows) {
        whereConditions.push({
          jobApplications: {
            some: {
              jobSite: jobApplicationsParams.jobSite,
            },
          },
        });
      }
      if (jobApplicationsParams.workflows?.some?.payload?.testSite) {
        whereConditions.push({
          jobApplications: {
            some: {
              workflows: {
                some: {
                  payload: {
                    testSite:
                      jobApplicationsParams.workflows?.some?.payload?.testSite,
                  },
                },
              },
            },
          },
        });
      }
      if (jobApplicationsParams.workflows?.some?.stateId) {
        whereConditions.push({
          jobApplications: {
            some: {
              workflows: {
                some: {
                  stateId: jobApplicationsParams.workflows?.some?.stateId,
                },
              },
            },
          },
        });
      }
    }

    if (whereConditions.length > 0) {
      where = {AND: whereConditions};
    }

    // [step 2] Count.
    return await this.prisma.candidate.count({
      where: where,
    });
  }

  @Get('')
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.Candidate)
  @ApiQuery({name: 'name', type: 'string'})
  @ApiQuery({name: 'email', type: 'string'})
  @ApiQuery({name: 'phone', type: 'string'})
  @ApiQuery({name: 'page', type: 'number'})
  @ApiQuery({name: 'pageSize', type: 'number'})
  @ApiQuery({name: 'jobApplications', type: 'string'})
  @ApiQuery({name: 'createdAt', type: 'string', isArray: true})
  @ApiQuery({name: 'updatedAt', type: 'string', isArray: true})
  async getCandidates(
    @Req() request: Request,
    @Query()
    query: {
      name?: string;
      email?: string;
      phone?: string;
      page?: string;
      pageSize?: string;
      jobApplications?: string;
      createdAt: string[];
      updatedAt: string[];
    }
  ): Promise<Candidate[]> {
    // [step 1] Construct where argument.
    let where: Prisma.CandidateWhereInput | undefined;
    const whereConditions: Prisma.CandidateWhereInput[] = [];
    const user = await this.accountService.me(request);
    if (user.profiles[0].organizationId) {
      whereConditions.push({organizationId: user.profiles[0].organizationId});
    }
    if (query.name && query.name.trim().length > 0) {
      whereConditions.push({
        profile: {
          fullName: {
            contains: query.name.trim(),
            mode: 'insensitive',
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
        profile: {
          OR: [
            {
              primaryPhone: {contains: query.phone.trim()},
            },
            {
              alternatePhone: {contains: query.phone.trim()},
            },
          ],
        },
      });
    }

    if (Array.isArray(query.updatedAt) && query.updatedAt.length === 2) {
      whereConditions.push({
        updatedAt: {
          gte: moment(query.updatedAt[0]).startOf('days').toISOString(),
          lte: moment(query.updatedAt[1]).endOf('days').toISOString(),
        },
      });
    }

    if (Array.isArray(query.createdAt) && query.createdAt.length === 2) {
      whereConditions.push({
        createdAt: {
          gte: moment(query.createdAt[0]).startOf('days').toISOString(),
          lte: moment(query.createdAt[1]).endOf('days').toISOString(),
        },
      });
    }

    if (query.jobApplications) {
      const jobApplicationsParams: Prisma.JobApplicationWhereInput = JSON.parse(
        query.jobApplications
      );
      if (jobApplicationsParams.workflows) {
        whereConditions.push({
          jobApplications: {
            some: {
              jobSite: jobApplicationsParams.jobSite,
            },
          },
        });
      }
      if (jobApplicationsParams.workflows?.some?.payload?.testSite) {
        whereConditions.push({
          jobApplications: {
            some: {
              workflows: {
                some: {
                  payload: {
                    testSite:
                      jobApplicationsParams.workflows?.some?.payload?.testSite,
                  },
                },
              },
            },
          },
        });
      }
      if (jobApplicationsParams.workflows?.some?.stateId) {
        whereConditions.push({
          jobApplications: {
            some: {
              workflows: {
                some: {
                  stateId: jobApplicationsParams.workflows?.some?.stateId,
                },
              },
            },
          },
        });
      }
    }

    if (whereConditions.length > 0) {
      where = {AND: whereConditions};
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
    const candidates = await this.prisma.candidate.findMany({
      where: where,
      orderBy: {updatedAt: 'desc'},
      take: take,
      skip: skip,
      include: {
        profile: true,
        jobApplications: {
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
      return {
        ...candidate,
        ...location,
        ...candidate.profile,
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
    const candidate = await this.prisma.candidate.findUniqueOrThrow({
      where: {id: candidateId},
      include: {profile: true},
    });

    return {
      ...candidate,
      ...location,
      ...candidate.profile,
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
          givenName: 'Robert',
          middleName: 'William',
          familyName: 'Smith',
          birthday: new Date(),
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
    body: Prisma.PlaceUpdateInput &
      Prisma.CandidateProfileUpdateWithoutCandidateInput
  ): Promise<Candidate> {
    const candidate = await this.prisma.candidate.findUniqueOrThrow({
      where: {id: candidateId},
      select: {placeId: true},
    });
    await this.prisma.place.update({
      where: {id: candidate.placeId ?? undefined},
      data: {
        address: body.address,
        address2: body.address2,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
      },
    });

    return await this.prisma.candidate.update({
      where: {id: candidateId},
      data: {
        profile: {
          update: {
            givenName: body.givenName,
            middleName: body.middleName,
            familyName: body.familyName,
            birthday: body.birthday,
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
    return await this.prisma.candidate.delete({
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
    return await this.prisma.candidate.findUniqueOrThrow({
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
