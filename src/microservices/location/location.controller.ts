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
import {PermissionAction, Prisma, Location} from '@prisma/client';
import {RequirePermission} from '../../applications/account/authorization/authorization.decorator';
import {LocationService} from './location.service';

@ApiTags('[Microservice] Location')
@ApiBearerAuth()
@Controller('locations')
export class LocationController {
  private locationService = new LocationService();

  @Post('')
  @RequirePermission(PermissionAction.create, Prisma.ModelName.Location)
  @ApiBody({
    description: 'Optional fields are address2 and geoJSON.',
    examples: {
      a: {
        summary: '1. Create',
        value: {
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
  async createLocation(
    @Body() body: Prisma.LocationUncheckedCreateInput
  ): Promise<Location> {
    return await this.locationService.create({data: body});
  }

  @Get('')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.Location)
  @ApiQuery({name: 'page', type: 'number'})
  @ApiQuery({name: 'pageSize', type: 'number'})
  async getLocations(
    @Query() query: {page?: string; pageSize?: string}
  ): Promise<Location[]> {
    // [step 1] Construct take and skip arguments.
    let take: number, skip: number;
    if (query.page && query.pageSize) {
      // Actually 'page' is string because it comes from URL param.
      const page = parseInt(query.page);
      const pageSize = parseInt(query.pageSize);
      if (page > 0 && pageSize > 0) {
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

    // [step 2] Get locations.
    return await this.locationService.findMany({
      take: take,
      skip: skip,
    });
  }

  @Get(':locationId')
  @RequirePermission(PermissionAction.read, Prisma.ModelName.Location)
  @ApiParam({
    name: 'locationId',
    schema: {type: 'string'},
    description: 'The uuid of the location.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  async getLocation(
    @Param('locationId') locationId: string
  ): Promise<Location | null> {
    return await this.locationService.findUnique({where: {id: locationId}});
  }

  @Patch(':locationId')
  @RequirePermission(PermissionAction.update, Prisma.ModelName.Location)
  @ApiParam({
    name: 'locationId',
    schema: {type: 'string'},
    description: 'The uuid of the location.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  @ApiBody({
    description: 'Update a specific user location.',
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
  async updateLocation(
    @Param('locationId') locationId: string,
    @Body() body: Prisma.LocationUpdateInput
  ): Promise<Location> {
    return await this.locationService.update({
      where: {id: locationId},
      data: body,
    });
  }

  @Delete(':locationId')
  @RequirePermission(PermissionAction.delete, Prisma.ModelName.Location)
  @ApiParam({
    name: 'locationId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  async deleteLocation(
    @Param('locationId') locationId: string
  ): Promise<Location> {
    return await this.locationService.delete({
      where: {id: locationId},
    });
  }

  /* End */
}
