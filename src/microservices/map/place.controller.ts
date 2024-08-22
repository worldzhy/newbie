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
import {Prisma, Place} from '@prisma/client';
import {PrismaService} from '@framework/prisma/prisma.service';

@ApiTags('Place')
@ApiBearerAuth()
@Controller('places')
export class PlaceController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('')
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
    return await this.prisma.place.create({data: body});
  }

  @Get('')
  async getPlaces(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.Place,
      pagination: {page, pageSize},
    });
  }

  @Get(':placeId')
  async getPlace(@Param('placeId') placeId: number): Promise<Place> {
    return await this.prisma.place.findUniqueOrThrow({where: {id: placeId}});
  }

  @Patch(':placeId')
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
    return await this.prisma.place.update({
      where: {id: placeId},
      data: body,
    });
  }

  @Delete(':placeId')
  async deletePlace(@Param('placeId') placeId: number): Promise<Place> {
    return await this.prisma.place.delete({
      where: {id: placeId},
    });
  }

  /* End */
}
