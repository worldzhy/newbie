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
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {
  Prisma,
  Event,
  EventContainer,
  EventContainerStatus,
  EventContainerOrigin,
  EventIssueStatus,
} from '@prisma/client';
import {HttpService} from '@nestjs/axios';
import {EventService} from '@microservices/event-scheduling/event.service';
import {EventIssueService} from '@microservices/event-scheduling/event-issue.service';
import {EventTypeService} from '@microservices/event-scheduling/event-type.service';
import {EventContainerService} from '@microservices/event-scheduling/event-container.service';
import {UserProfileService} from '@microservices/account/user/user-profile.service';
import {daysOfMonth} from '@toolkit/utilities/datetime.util';

@ApiTags('Mindbody')
@ApiBearerAuth()
@Controller('mindbody')
export class MindbodyController {
  constructor(
    private readonly httpService: HttpService,
    private readonly eventService: EventService,
    private readonly eventIssueService: EventIssueService,
    private readonly eventContainerService: EventContainerService,
    private readonly eventTypeService: EventTypeService,
    private readonly userProfileService: UserProfileService
  ) {}

  @Get('class-decriptions')
  async getClassDescriptions(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number
  ) {
    // [step 2] Post schedule to Mindbody.
    const tokenResponse = await this.httpService.axiosRef.post(
      'https://api.mindbodyonline.com/public/v6/usertoken/issue',
      {Username: 'Siteowner', Password: 'apitest1234'},
      {
        headers: {
          'API-Key': '180136b17972442c9120e0767e7de5e7',
          'Content-Type': 'application/json',
          siteId: '-99',
        },
      }
    );
    try {
      const a1 = await this.httpService.axiosRef.get(
        'https://api.mindbodyonline.com/public/v6/site/locations',
        {
          headers: {
            'API-Key': '180136b17972442c9120e0767e7de5e7',
            Accept: 'application/json',
            siteId: '-99',
            authorization: tokenResponse.data['AccessToken'],
          },
        }
      );

      console.log(a1.data.PaginationResponse);
      console.log(a1.data.Locations[0]);
      const a2 = await this.httpService.axiosRef.get(
        'https://api.mindbodyonline.com/public/v6/class/classdescriptions',
        {
          headers: {
            'API-Key': '180136b17972442c9120e0767e7de5e7',
            Accept: 'application/json',
            siteId: '-99',
            authorization: tokenResponse.data['AccessToken'],
          },
          data: {
            StaffId: 1,
            LocationId: 1,
            // StartClassDateTime: '2023-05-13T12:52:32.123Z',
            // EndClassDateTime: '2023-10-13T12:52:32.123Z',
          },
        }
      );

      console.log(a2.data.PaginationResponse);
      console.log(a2.data.ClassDescriptions[0]);
      const mindbodyResponse = await this.httpService.axiosRef.post(
        'https://api.mindbodyonline.com/public/v6/class/addclassschedule',
        {
          ClassDescriptionId: 4,
          LocationId: 1,
          StartDate: '2023-03-13T12:52:32.123Z',
          EndDate: '2023-03-13T12:52:32.123Z',
          StartTime: '2023-03-13T20:00:32.123Z',
          DaySunday: true,
          DayMonday: true,
          DayTuesday: true,
          DayWednesday: true,
          DayThursday: true,
          DaySaturday: true,
          StaffId: tokenResponse.data['User']['Id'],
          StaffPayRate: 1,
          ResourceId: 20,
          MaxCapacity: 20,
          PricingOptionsProductIds: [1],
          AllowDateForwardEnrollment: true,
          AllowOpenEnrollment: true,
          BookingStatus: 'Free',
          WaitlistCapacity: 1,
          WebCapacity: 1,
          DayFriday: true,
          EndTime: '2023-03-13T21:00:15Z',
        },
        {
          headers: {
            'API-Key': '180136b17972442c9120e0767e7de5e7',
            Accept: 'application/json',
            'Content-Type': 'application/json',
            siteId: '-99',
            authorization: tokenResponse.data['AccessToken'],
          },
        }
      );
      console.log(mindbodyResponse.data);
    } catch (error) {
      console.log('$$$$$$$');
      console.log(error.response.data['Error']);
    }
  }

  @Get('locations')
  async getEventContainer(@Param('eventContainerId') eventContainerId: number) {
    return await this.eventContainerService.findUniqueOrThrow({
      where: {id: eventContainerId},
    });
  }

  /* End */
}
