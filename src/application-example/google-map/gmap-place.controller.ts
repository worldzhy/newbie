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
import {PermissionAction, Prisma, GmapPlace} from '@prisma/client';
import {RequirePermission} from '@microservices/account/authorization/authorization.decorator';
import {GmapPlaceService} from '@microservices/google-map/gmap-place.service';
import {generatePaginationParams} from '@toolkit/pagination/pagination';

@ApiTags('GmapPlace')
@ApiBearerAuth()
@Controller('locations')
export class GmapPlaceController {
  constructor(private readonly locationService: GmapPlaceService) {}

  @Post('')
  @RequirePermission(PermissionAction.Create, Prisma.ModelName.GmapPlace)
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
  async createGmapPlace(
    @Body() body: Prisma.GmapPlaceUncheckedCreateInput
  ): Promise<GmapPlace> {
    return await this.locationService.create({data: body});
  }

  @Get('')
  @RequirePermission(PermissionAction.List, Prisma.ModelName.GmapPlace)
  @ApiQuery({name: 'page', type: 'number'})
  @ApiQuery({name: 'pageSize', type: 'number'})
  async getGmapPlaces(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ): Promise<GmapPlace[]> {
    // [step 1] Construct take and skip arguments.
    const {take, skip} = generatePaginationParams({
      page: page,
      pageSize: pageSize,
    });

    // [step 2] Get locations.
    return await this.locationService.findMany({
      take: take,
      skip: skip,
    });
  }

  @Get(':placeId')
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.GmapPlace)
  @ApiParam({
    name: 'placeId',
    schema: {type: 'string'},
    description: 'The uuid of the location.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  async getGmapPlace(
    @Param('placeId') placeId: number
  ): Promise<GmapPlace | null> {
    return await this.locationService.findUnique({where: {id: placeId}});
  }

  @Patch(':placeId')
  @RequirePermission(PermissionAction.Update, Prisma.ModelName.GmapPlace)
  @ApiParam({
    name: 'placeId',
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
  async updateGmapPlace(
    @Param('placeId') placeId: number,
    @Body() body: Prisma.GmapPlaceUpdateInput
  ): Promise<GmapPlace> {
    return await this.locationService.update({
      where: {id: placeId},
      data: body,
    });
  }

  @Delete(':placeId')
  @RequirePermission(PermissionAction.Delete, Prisma.ModelName.GmapPlace)
  @ApiParam({
    name: 'placeId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  async deleteGmapPlace(@Param('placeId') placeId: number): Promise<GmapPlace> {
    return await this.locationService.delete({
      where: {id: placeId},
    });
  }

  /* End */
}
