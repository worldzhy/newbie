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
import {Prisma, Candidate, PermissionAction} from '@prisma/client';
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
          email: 'mary@hd.com',
          phone: '121289182',
          givenName: 'Mary',
          middleName: 'Rose',
          familyName: 'Johnson',
          suffix: 'PhD',
          birthday: new Date(),
          gender: 'male',
          address: '456 White Finch St. North Augusta, SC 29860',
          zipcode: '21000',
          geoJSON: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [125.6, 10.1],
            },
            properties: {
              name: 'Dinagat Islands',
            },
          },
          websites: {facebook: 'https://www.facebook.com/grace'},
          picture:
            'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg/800px-Steve_Jobs_Headshot_2010-CROP_%28cropped_2%29.jpg',
        },
      },
    },
  })
  async createCandidate(
    @Body() body: Prisma.CandidateUncheckedCreateInput
  ): Promise<Candidate> {
    return await this.candidateService.create({data: body});
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

    // [step 3] Get users.
    return await this.candidateService.findMany({
      where: where,
      take: take,
      skip: skip,
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
    return await this.candidateService.findUnique({where: {id: candidateId}});
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
          email: 'robert.smith@hd.com',
          phone: '131280122',
          givenName: 'Robert',
          middleName: 'William',
          familyName: 'Smith',
        },
      },
    },
  })
  async updateCandidate(
    @Param('candidateId') candidateId: string,
    @Body() body: Prisma.CandidateUpdateInput
  ): Promise<Candidate> {
    return await this.candidateService.update({
      where: {id: candidateId},
      data: body,
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

  /* End */
}
