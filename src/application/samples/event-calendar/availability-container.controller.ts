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
import {
  AvailabilityContainer,
  AvailabilityContainerStatus,
  Prisma,
} from '@prisma/client';
import {AvailabilityContainerService} from '../../../microservices/event-calendar/availability-container.service';

@ApiTags('Samples: Event Calendar / Availability Container')
@ApiBearerAuth()
@Controller('availability-containers')
export class AvailabilityContainerController {
  constructor(
    private readonly availabilityContainerService: AvailabilityContainerService
  ) {}

  @Post('')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'Henry English Class Room',
          status: AvailabilityContainerStatus.ACTIVE,
          dateOfOpening: '2023-08-10',
          dateOfClosure: '2024-08-12',
          timezone: 'China Standard Time',
        },
      },
    },
  })
  async createAvailabilityContainer(
    @Body() body: Prisma.AvailabilityContainerUncheckedCreateInput
  ): Promise<AvailabilityContainer> {
    return await this.availabilityContainerService.create({
      data: body,
    });
  }

  @Get('')
  async getAvailabilityContainers(): Promise<AvailabilityContainer[]> {
    return await this.availabilityContainerService.findMany({});
  }

  @Get(':availabilityContainerId')
  @ApiParam({
    name: 'availabilityContainerId',
    schema: {type: 'number'},
    description: 'The id of the availability container.',
    example: 1,
  })
  async getAvailabilityContainer(
    @Param('availabilityContainerId') availabilityContainerId: number
  ): Promise<AvailabilityContainer> {
    return await this.availabilityContainerService.findUniqueOrThrow({
      where: {id: availabilityContainerId},
    });
  }

  @Patch(':availabilityContainerId')
  @ApiParam({
    name: 'availabilityContainerId',
    schema: {type: 'number'},
    description: 'The id of the availability container.',
    example: 1,
  })
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update name',
        value: {
          name: 'Henry English Class Room',
          status: AvailabilityContainerStatus.ACTIVE,
          dateOfOpening: '2023-08-10',
          dateOfClosure: '2024-08-12',
          timezone: 'China Standard Time',
        },
      },
    },
  })
  async updateAvailabilityContainer(
    @Param('availabilityContainerId') availabilityContainerId: number,
    @Body()
    body: Prisma.AvailabilityContainerUpdateInput
  ): Promise<AvailabilityContainer> {
    return await this.availabilityContainerService.update({
      where: {id: availabilityContainerId},
      data: body,
    });
  }

  @Delete(':availabilityContainerId')
  @ApiParam({
    name: 'availabilityContainerId',
    schema: {type: 'number'},
    example: 1,
  })
  async deleteAvailabilityContainer(
    @Param('availabilityContainerId') availabilityContainerId: number
  ): Promise<AvailabilityContainer> {
    return await this.availabilityContainerService.delete({
      where: {id: availabilityContainerId},
    });
  }

  /* End */
}
