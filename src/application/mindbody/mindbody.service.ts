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
  private headers;

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

  async setStudioId(stdudioId) {
    console.log(stdudioId);
    // this.headers.stdudioId = stdudioId;
    this.headers.SiteId = 44717;
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

  async getProducts(query) {
    const params = toMbParams(query);
    const headers = parseHeaders(this.headers, query);

    try {
      const response = await this.httpService.axiosRef.get(
        `${this.mbUrl}sale/products`,
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

    const _params = {
      ...params,
      locationId: 1,
    };
    try {
      const response = await this.httpService.axiosRef.get(
        `${this.mbUrl}Staff/Staff`,
        {
          headers,
          params: _params,
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

  async queryClinets(query) {
    this.setStudioId(query.studioId);
    await this.getUserToken();
    const params = toMbParams(query);
    const headers = parseHeaders(this.headers, query);

    try {
      const response = await this.httpService.axiosRef.get(
        `${this.mbUrl}client/clients`,
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

  async stopClassSchedules(query) {
    const {data: schs} = await this.getClassSchedules(query);

    const {ClassSchedules} = schs;

    const _schs = ClassSchedules.map(d => {
      return {
        Id: d.Id,
        Name: d.ClassDescription.Name,
        Classes: d.Classes,
        DescActive: d.ClassDescription.Active,
        IsAvailable: d.IsAvailable,
        DaySunday: d.DaySunday,
        DayMonday: d.DayMonday,
        DayTuesday: d.DayTuesday,
        DayWednesday: d.DayWednesday,
        DayThursday: d.DayThursday,
        DayFriday: d.DayFriday,
        DaySaturday: d.DaySaturday,
        StartTime: d.StartTime,
        EndTime: d.EndTime,
        StartDate: d.StartDate,
        EndDate: d.EndDate,
      };
    });

    const avaSchs = _schs.filter(d => {
      return d.IsAvailable;
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any[] = [];

    for (const _sch of avaSchs) {
      const params = {
        studioId: query.studioId,
        locationId: query.locationId,
        scheduleId: _sch.Id,
      };

      const startDate = moment(_sch.StartDate);
      const endOfMonth = moment().endOf('month');

      let resp;
      if (startDate.isBefore(endOfMonth)) {
        resp = await this.endClassSchduleById(params);
      } else {
        resp = await this.endClassFeatureSchduleById(params);
      }

      results.push(resp);
    }
    return results;
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
    this.setStudioId(data.studioId);
    await this.getUserToken();
    const {schedule} = data;

    const _schedule = {...schedule, LocationId: 3};
    const headers = parseHeaders(this.headers, data);

    try {
      const response = await this.httpService.axiosRef.post(
        `${this.mbUrl}class/addclassschedule`,
        _schedule,
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

  async endClassSchduleById(data: endClassScheduleDto, EndDate = undefined) {
    this.setStudioId(data.studioId);
    await this.getUserToken();

    let _EndDate = moment().endOf('month').toISOString();

    if (EndDate) {
      _EndDate = EndDate;
    }

    const schedule = {
      ClassId: data.scheduleId,
      EndDate: _EndDate,
    };
    const params = {...data, schedule};

    return this.updateClassSchedule(params);
  }

  async endClassFeatureSchduleById(data: endClassScheduleDto) {
    this.setStudioId(data.studioId);
    await this.getUserToken();

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

    return this.updateClassSchedule(params);
  }

  async updateClassSchedule(data: AddClassScheduleDto) {
    this.setStudioId(data.studioId);
    await this.getUserToken();
    const headers = parseHeaders(this.headers, data);
    const {schedule} = data;
    const _schedule = {...schedule, LocationId: 3};

    try {
      const response = await this.httpService.axiosRef.post(
        `${this.mbUrl}class/updateclassschedule`,
        _schedule,
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
