import {Injectable} from '@nestjs/common';
import {HttpService} from '@nestjs/axios';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class MindbodyService {
  private apiKey: string;
  private siteId: number;
  private userId: string;
  private userToken: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
  ) {
    this.apiKey = this.configService.getOrThrow<string>(
      'microservice.mindbody.apiKey'
    );
    this.siteId = this.configService.getOrThrow<number>(
      'microservice.mindbody.siteId'
    );
  }

  async login() {
    const response = await this.httpService.axiosRef.post(
      'https://api.mindbodyonline.com/public/v6/usertoken/issue',
      {Username: 'Siteowner', Password: 'apitest1234'},
      {
        headers: {
          'API-Key': this.apiKey,
          'Content-Type': 'application/json',
          siteId: this.siteId,
        },
      }
    );

    this.userId = response.data['User']['Id'];
    this.userToken = response.data['AccessToken'];
  }

  async getClassDescriptions() {
    try {
      const response = await this.httpService.axiosRef.get(
        'https://api.mindbodyonline.com/public/v6/class/classdescriptions',
        {
          headers: {
            'API-Key': this.apiKey,
            Accept: 'application/json',
            siteId: this.siteId,
            authorization: this.userToken,
          },
          data: {
            StaffId: 1,
            LocationId: 1,
            // StartClassDateTime: '2023-05-13T12:52:32.123Z',
            // EndClassDateTime: '2023-10-13T12:52:32.123Z',
          },
        }
      );

      return response.data.ClassDescriptions;
    } catch (error) {
      console.log(error.response.data['Error']);
    }
  }

  async getLocations() {
    try {
      const response = await this.httpService.axiosRef.get(
        'https://api.mindbodyonline.com/public/v6/site/locations',
        {
          headers: {
            'API-Key': this.apiKey,
            Accept: 'application/json',
            siteId: this.siteId,
            authorization: this.userToken,
          },
        }
      );

      return response.data.Locations;
    } catch (error) {
      console.log(error.response.data['Error']);
    }
  }

  async addClassSchedule() {
    try {
      const response = await this.httpService.axiosRef.post(
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
          StaffId: this.userId,
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
            'API-Key': this.apiKey,
            Accept: 'application/json',
            'Content-Type': 'application/json',
            siteId: this.siteId,
            authorization: this.userToken,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.log(error.response.data['Error']);
    }
  }
  /* End */
}
