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
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {PermissionAction, Prisma, Place} from '@prisma/client';
import {RequirePermission} from '@microservices/account/security/authorization/authorization.decorator';
import {PlaceService} from '@microservices/map/place.service';

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
  async getPlaces(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number
  ) {
    return await this.locationService.findManyInManyPages({page, pageSize});
  }

  @Get(':placeId')
  @RequirePermission(PermissionAction.Get, Prisma.ModelName.Place)
  async getPlace(@Param('placeId') placeId: number): Promise<Place> {
    return await this.locationService.findUniqueOrThrow({where: {id: placeId}});
  }

  @Patch(':placeId')
  @RequirePermission(PermissionAction.Update, Prisma.ModelName.Place)
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
  async deletePlace(@Param('placeId') placeId: number): Promise<Place> {
    return await this.locationService.delete({
      where: {id: placeId},
    });
  }

  /* End */
}
