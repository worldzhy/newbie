import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {HttpService} from '@nestjs/axios';
import {ConfigService} from '@nestjs/config';
import {toMbParams, parseHeaders} from './util';
import {AddClassScheduleDto, endClassScheduleDto} from './mindbody.dto';
import * as _ from 'lodash';
import * as moment from 'moment';

@Injectable()
export class MindbodyService {
  private apiKey: string;
  private username;
  private password;
  private mbUrl;
  private accessToken;
  private siteId: number;
  private headers: any;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.apiKey = this.configService.getOrThrow<string>(
      'microservice.mindbody.apiKey'
    );
    this.siteId = this.configService.getOrThrow<number>(
      'microservice.mindbody.siteId'
    );
    this.username = this.configService.get('microservice.mindbody.username');
    this.password = this.configService.get('microservice.mindbody.password');

    const SiteId = this.siteId;

    this.headers = {
      'Content-Type': 'application/json',
      'API-Key': this.apiKey,
      SiteId,
    };
    this.mbUrl = this.configService.get('microservice.mindbody.mbUrl');
  }

  async getUserToken() {
    const data = {username: this.username, password: this.password};
    try {
      const response = await this.httpService.axiosRef.post(
        `${this.mbUrl}usertoken/issue`,
        data,
        {
          headers: this.headers,
        }
      );

      if (response.status === 200) {
        this.accessToken = _.get(response, 'data.AccessToken');
        this.headers.Authorization = this.accessToken;
      }
    } catch (error) {
      return this.errorHandle(error);
    }
  }

  async getClassDescriptions(query) {
    const params = toMbParams(query);
    const headers = parseHeaders(this.headers, query);

    try {
      const response = await this.httpService.axiosRef.get(
        `${this.mbUrl}class/classdescriptions`,
        {
          headers,
          params,
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.errorHandle(error);
    }
  }

  async getClasses(query) {
    const params = toMbParams(query);
    const headers = parseHeaders(this.headers, query);

    params.startDateTime = query.startDateTime;
    params.endDateTime = query.endDateTime;

    try {
      const response = await this.httpService.axiosRef.get(
        `${this.mbUrl}class/classes`,
        {
          headers,
          params,
        }
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.errorHandle(error);
    }
  }

  async getClassVisits(query) {
    const params = toMbParams(query);
    const headers = parseHeaders(this.headers, query);

    try {
      const response = await this.httpService.axiosRef.get(
        `${this.mbUrl}class/classvisits`,
        {
          headers,
          params,
        }
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.errorHandle(error);
    }
  }

  async getStaff(query) {
    const params = toMbParams(query);
    const headers = parseHeaders(this.headers, query);

    try {
      const response = await this.httpService.axiosRef.get(
        `${this.mbUrl}Staff/Staff`,
        {
          headers,
          params,
        }
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.errorHandle(error);
    }
  }

  async getClassSchduleById(schduleId) {
    try {
      const response = await this.httpService.axiosRef.get(
        `${this.mbUrl}class/classschedules`,
        {
          headers: this.headers,
          params: {classScheduleIds: schduleId},
        }
      );

      if (response.data.ClassSchedules.length > 0) {
        return {
          success: true,
          data: response.data.ClassSchedules[0],
        };
      } else {
        return {
          success: false,
        };
      }
    } catch (error) {
      return this.errorHandle(error);
    }
  }

  async getClassSchedules(query) {
    const params = toMbParams(query);
    const headers = parseHeaders(this.headers, query);

    try {
      const response = await this.httpService.axiosRef.get(
        `${this.mbUrl}class/classschedules`,
        {
          headers,
          params,
        }
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.errorHandle(error);
    }
  }

  async getLocations(query) {
    const params = toMbParams(query);
    const headers = parseHeaders(this.headers, query);
    try {
      const response = await this.httpService.axiosRef.get(
        `${this.mbUrl}site/locations`,
        {
          headers,
          params,
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.errorHandle(error);
    }
  }

  async getResources(query) {
    const params = toMbParams(query);
    const headers = parseHeaders(this.headers, query);
    try {
      const response = await this.httpService.axiosRef.get(
        `${this.mbUrl}site/resources`,
        {
          headers,
          params,
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.errorHandle(error);
    }
  }

  errorHandle(error) {
    if (error.response.status === 400) {
      return {
        success: false,
        data: error.response.data['Error'],
      };
    }
    throw new HttpException(
      JSON.stringify(error.response.data['Error']),
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  async addClassSchedule(data: AddClassScheduleDto) {
    await this.getUserToken();
    let {schedule} = data;
    const headers = parseHeaders(this.headers, data);

    try {
      const response = await this.httpService.axiosRef.post(
        `${this.mbUrl}class/addclassschedule`,
        schedule,
        {
          headers,
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.errorHandle(error);
    }
  }

  async endClassSchduleById(data: endClassScheduleDto) {
    await this.getUserToken();
    const headers = parseHeaders(this.headers, data);

    const schedule = {
      ClassId: data.scheduleId,
      DaySunday: false,
      DayMonday: false,
      DayTuesday: false,
      DayWednesday: false,
      DayThursday: false,
      DayFriday: false,
      DaySaturday: false,
    };
    const params = {...data, schedule};

    console.log(params);

    return this.updateClassSchedule(params);
  }

  async updateClassSchedule(data: AddClassScheduleDto) {
    await this.getUserToken();
    const headers = parseHeaders(this.headers, data);
    const {schedule} = data;

    try {
      const response = await this.httpService.axiosRef.post(
        `${this.mbUrl}class/updateclassschedule`,
        schedule,
        {
          headers,
        }
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return this.errorHandle(error);
    }
  }

  /* End */
}
