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
import {PermissionAction, Prisma, CandidateLocation} from '@prisma/client';
import {RequirePermission} from 'src/applications/account/authorization/authorization.decorator';
import {CandidateLocationService} from './location.service';

@ApiTags('[Application] Recruitment / Candidate / Location')
@ApiBearerAuth()
@Controller('candidate-locations')
export class CandidateLocationController {
  constructor(private candidateLocationService: CandidateLocationService) {}

  @Post('')
  @RequirePermission(
    PermissionAction.create,
    Prisma.ModelName.CandidateLocation
  )
  @ApiBody({
    description: 'Optional fields are address2 and geoJSON.',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          candidateId: '924da395-1921-45fe-b7f5-1198ed78ac24',
          address: '456 White Finch St. North Augusta, SC 29860',
          address2: '',
          city: 'Baltimore',
          state: 'MD',
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
        },
      },
    },
  })
  async createCandidateLocation(
    @Body() body: Prisma.CandidateLocationUncheckedCreateInput
  ): Promise<CandidateLocation> {
    return await this.candidateLocationService.create({data: body});
  }

  @Get('')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.CandidateLocation)
  async getCandidateLocations(
    @Query() query: {page?: string; pageSize?: string}
  ): Promise<CandidateLocation[]> {
    // [step 1] Construct take and skip arguments.
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

    // [step 2] Get candidate locations.
    return await this.candidateLocationService.findMany({
      take: take,
      skip: skip,
    });
  }

  @Get(':locationId')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.CandidateLocation)
  @ApiParam({
    name: 'locationId',
    schema: {type: 'string'},
    description: 'The uuid of the location.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  async getCandidateLocation(
    @Param('locationId') locationId: string
  ): Promise<CandidateLocation | null> {
    return await this.candidateLocationService.findUnique({
      where: {id: locationId},
    });
  }

  @Patch(':locationId')
  @RequirePermission(
    PermissionAction.update,
    Prisma.ModelName.CandidateLocation
  )
  @ApiParam({
    name: 'locationId',
    schema: {type: 'string'},
    description: 'The uuid of the location.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  @ApiBody({
    description: 'Update a specific candidate location.',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          address: '456 White Finch St. North Augusta, SC 29860',
          address2: '',
          city: 'New York City',
          state: 'NY',
          zipcode: '10001',
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
        },
      },
    },
  })
  async updateCandidateLocation(
    @Param('locationId') locationId: string,
    @Body() body: Prisma.CandidateLocationUpdateInput
  ): Promise<CandidateLocation> {
    return await this.candidateLocationService.update({
      where: {id: locationId},
      data: body,
    });
  }

  @Delete(':locationId')
  @RequirePermission(
    PermissionAction.delete,
    Prisma.ModelName.CandidateLocation
  )
  @ApiParam({
    name: 'locationId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  async deleteCandidateLocation(
    @Param('locationId') locationId: string
  ): Promise<CandidateLocation> {
    return await this.candidateLocationService.delete({
      where: {id: locationId},
    });
  }

  /* End */
}
