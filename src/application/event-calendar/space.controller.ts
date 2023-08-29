import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {Space, Prisma} from '@prisma/client';
import {SpaceService} from '@microservices/event-scheduling/space.service';

@ApiTags('Event Calendar / Space')
@ApiBearerAuth()
@Controller('spaces')
export class SpaceController {
  constructor(private readonly spaceService: SpaceService) {}

  @Post('')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'Speaking Space',
          numberOfSeats: 20,
          timeOfDayStart: '6:00',
          timeOfDayEnd: '22:00',
        },
      },
    },
  })
  async createSpace(
    @Body() body: Prisma.SpaceUncheckedCreateInput
  ): Promise<Space> {
    return await this.spaceService.create({
      data: body,
    });
  }

  @Get('')
  async getSpacees(): Promise<Space[]> {
    return await this.spaceService.findMany({});
  }

  @Get(':spaceId')
  @ApiParam({
    name: 'spaceId',
    schema: {type: 'number'},
    description: 'The id of the event.',
    example: 1,
  })
  async getSpace(@Param('spaceId') spaceId: number): Promise<Space> {
    return await this.spaceService.findUniqueOrThrow({
      where: {id: spaceId},
    });
  }

  @Patch(':spaceId')
  @ApiParam({
    name: 'spaceId',
    schema: {type: 'number'},
    description: 'The id of the event.',
    example: 1,
  })
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          name: 'Speaking Space',
          numberOfSeats: 25,
          timeOfDayStart: '7:00',
          timeOfDayEnd: '23:00',
        },
      },
    },
  })
  async updateSpace(
    @Param('spaceId') spaceId: number,
    @Body()
    body: Prisma.SpaceUpdateInput
  ): Promise<Space> {
    return await this.spaceService.update({
      where: {id: spaceId},
      data: body,
    });
  }

  @Delete(':spaceId')
  @ApiParam({
    name: 'spaceId',
    schema: {type: 'number'},
    example: 1,
  })
  async deleteSpace(@Param('spaceId') spaceId: number): Promise<Space> {
    return await this.spaceService.delete({
      where: {id: spaceId},
    });
  }

  /* End */
}
