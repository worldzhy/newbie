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
import {PermissionAction, Prisma, Place} from '@prisma/client';
import {RequirePermission} from '@microservices/account/authorization/authorization.decorator';
import {PlaceService} from '@microservices/map/place.service';
import {generatePaginationParams} from '@toolkit/pagination/pagination';

@ApiTags('Place')
@ApiBearerAuth()
@Controller('places')
export class PlaceController {
  constructor(private readonly locationService: PlaceService) {}

  @Post('')
  @RequirePermission(PermissionAction.Create, Prisma.ModelName.Place)
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
  async createPlace(
    @Body() body: Prisma.PlaceUncheckedCreateInput
  ): Promise<Place> {
    return await this.locationService.create({data: body});
  }

  @Get('')
  @RequirePermission(PermissionAction.List, Prisma.ModelName.Place)
  @ApiQuery({name: 'page', type: 'number'})
  @ApiQuery({name: 'pageSize', type: 'number'})
  async getPlaces(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ): Promise<Place[]> {
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
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.Place)
  @ApiParam({
    name: 'placeId',
    schema: {type: 'string'},
    description: 'The uuid of the location.',
    example: 'fd5c948e-d15d-48d6-a458-7798e4d9921c',
  })
  async getPlace(@Param('placeId') placeId: number): Promise<Place | null> {
    return await this.locationService.findUnique({where: {id: placeId}});
  }

  @Patch(':placeId')
  @RequirePermission(PermissionAction.Update, Prisma.ModelName.Place)
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
  async updatePlace(
    @Param('placeId') placeId: number,
    @Body() body: Prisma.PlaceUpdateInput
  ): Promise<Place> {
    return await this.locationService.update({
      where: {id: placeId},
      data: body,
    });
  }

  @Delete(':placeId')
  @RequirePermission(PermissionAction.Delete, Prisma.ModelName.Place)
  @ApiParam({
    name: 'placeId',
    schema: {type: 'string'},
    example: 'b3a27e52-9633-41b8-80e9-ec3633ed8d0a',
  })
  async deletePlace(@Param('placeId') placeId: number): Promise<Place> {
    return await this.locationService.delete({
      where: {id: placeId},
    });
  }

  /* End */
}
