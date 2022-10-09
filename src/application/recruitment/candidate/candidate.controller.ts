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
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {Prisma, Candidate} from '@prisma/client';
import {CandidateService} from './candidate.service';

@ApiTags('[Application] Recruitment / Candidate')
@ApiBearerAuth()
@Controller('recruitment-candidates')
export class CandidateController {
  constructor(private candidateService: CandidateService) {}

  @Post('')
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
  async getCandidates(
    @Query() query: {name?: string; page?: string}
  ): Promise<Candidate[]> {
    // [step 1] Construct where argument.
    let where: Prisma.CandidateWhereInput | undefined;
    if (query.name) {
      const name = query.name.trim();
      if (name.length > 0) {
        where = {
          OR: [
            {givenName: {search: name}},
            {familyName: {search: name}},
            {middleName: {search: name}},
          ],
        };
      }
    }

    // [step 2] Construct take and skip arguments.
    let take: number, skip: number;
    if (query.page) {
      // Actually 'page' is string because it comes from URL param.
      const page = parseInt(query.page);
      if (page > 0) {
        take = 10;
        skip = 10 * (page - 1);
      } else {
        throw new BadRequestException('The page must be larger than 0.');
      }
    } else {
      take = 10;
      skip = 0;
    }

    // [step 3] Get user candidates.
    return await this.candidateService.findMany({
      where: where,
      take: take,
      skip: skip,
    });
  }

  @Get(':candidateId')
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
