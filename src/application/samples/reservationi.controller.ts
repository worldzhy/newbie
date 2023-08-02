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
  AvailabilityPeriod,
  AvailabilityRoom,
  Prisma,
  Reservation,
} from '@prisma/client';
import {ReservationService} from '../../microservices/reservation/reservation.service';
import {AvailabilityRoomService} from '../../microservices/reservation/availability-room.service';
import {AvailabilityPeriodService} from '../../microservices/reservation/availability-period.service';

@ApiTags('Samples: Reservation')
@ApiBearerAuth()
@Controller('reservations')
export class ReservationController {
  constructor(
    private readonly availabilityRoomService: AvailabilityRoomService,
    private readonly availabilityPeriodService: AvailabilityPeriodService,
    private readonly reservationService: ReservationService
  ) {}

  async createAvailabilityRoom(
    @Body() body: Prisma.AvailabilityRoomUncheckedCreateInput
  ): Promise<AvailabilityRoom> {
    return await this.availabilityRoomService.create({
      data: body,
    });
  }

  @Post('')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          durationByMinute: 60,
          seats: 1,
          timezone: 'America/New_York',
          minBookingBeforeByMinute: 60,
          maxBookingBeforeByDay: 30,
          startDate: '2023-08-02',
          endDate: '2023-08-24',
          periodType: 'Fixed',
          dateRules: [
            {
              date: '2023-08-02',
              intervals: [
                {
                  endTime: '17:00',
                  startTime: '08:00',
                },
              ],
            },
          ],
          weekRules: [
            {
              day: 'Sunday',
              intervals: [],
            },
            {
              day: 'Monday',
              intervals: [
                {
                  endTime: '17:00',
                  startTime: '08:00',
                },
              ],
            },
            {
              day: 'Tuesday',
              intervals: [
                {
                  endTime: '17:00',
                  startTime: '08:00',
                },
              ],
            },
            {
              day: 'Wednesday',
              intervals: [
                {
                  endTime: '17:00',
                  startTime: '08:00',
                },
              ],
            },
            {
              day: 'Thursday',
              intervals: [
                {
                  endTime: '17:00',
                  startTime: '08:00',
                },
              ],
            },
            {
              day: 'Friday',
              intervals: [
                {
                  endTime: '17:00',
                  startTime: '08:00',
                },
              ],
            },
            {
              day: 'Saturday',
              intervals: [],
            },
          ],
          maxBookingDaily: 2,
          serviceId: 6,
        },
      },
    },
  })
  async createAvailabilityPeriods(
    @Body() body: Prisma.AvailabilityPeriodUncheckedCreateInput
  ): Promise<AvailabilityPeriod> {
    return await this.availabilityPeriodService.create({
      data: body,
    });
  }

  @Get('')
  async getReservations(): Promise<Reservation[]> {
    return await this.reservationService.findMany({});
  }

  @Get(':reservationId')
  @ApiParam({
    name: 'reservationId',
    schema: {type: 'string'},
    description: 'The id of the reservation.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getReservation(
    @Param('reservationId') reservationId: string
  ): Promise<Reservation | null> {
    return await this.reservationService.findUnique({
      where: {id: reservationId},
      include: {routes: true, views: true, states: true},
    });
  }

  @Patch(':reservationId')
  @ApiParam({
    name: 'reservationId',
    schema: {type: 'string'},
    description: 'The id of the reservation.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update name',
        value: {
          name: 'InceptionPad Inc',
        },
      },
    },
  })
  async updateReservation(
    @Param('reservationId') reservationId: string,
    @Body()
    body: Prisma.ReservationUpdateInput
  ): Promise<Reservation> {
    return await this.reservationService.update({
      where: {id: reservationId},
      data: body,
    });
  }

  @Delete(':reservationId')
  @ApiParam({
    name: 'reservationId',
    schema: {type: 'string'},
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async deleteReservation(
    @Param('reservationId') reservationId: string
  ): Promise<Reservation> {
    return await this.reservationService.delete({
      where: {id: reservationId},
    });
  }

  /* End */
}
