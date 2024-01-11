/* eslint-disable @typescript-eslint/no-explicit-any */
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {HttpService} from '@nestjs/axios';
import {ConfigService} from '@nestjs/config';
import {AddClassScheduleDto, endClassScheduleDto} from './mindbody.dto';
import * as _ from 'lodash';
import * as moment from 'moment';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class MindbodyService {
  private apiKey: string;
  private username;
  private password;
  private mbUrl;
  private accessToken;
  private siteId: number;
  private headers;
  private setFree;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService
  ) {
    this.apiKey = this.configService.getOrThrow<string>(
      'microservice.mindbody.apiKey'
    );

    this.username = this.configService.get('microservice.mindbody.username');
    this.password = this.configService.get('microservice.mindbody.password');

    this.headers = {
      'Content-Type': 'application/json',
      'API-Key': this.apiKey,
    };
    this.mbUrl = this.configService.get('microservice.mindbody.mbUrl');
    this.setFree = this.configService.get('microservice.mindbody.setFree');
  }

  toMbParams(query: any) {
    const {
      pageSize = 10,
      page = 1,
      locationId,
      startDate,
      endDate,
      locationIds,
      filters,
      ScheduleType,
    } = query;
    const offest = pageSize * (page - 1);
    const params = {
      limit: pageSize,
      offest,
      ...query,
    };

    if (this.setFree) {
      if (locationId) {
        params.locationId = locationId;
      }
      if (locationIds) {
        params.locationIds = locationIds;
      }
    } else {
      if (locationId) {
        params.locationId = 3;
      }
      params.locationId = 3;

      if (locationIds) {
        params.locationIds = 3;
      }
      params.locationIds = 3;
    }

    params.scheduleTypes = 'Resource';

    if (startDate) {
      params.startDate = startDate;
    }

    if (ScheduleType) {
      params.ScheduleType = ScheduleType;
    }

    if (filters) {
      params.filter = filters;
    }

    if (query.classScheduleIds) {
      params.classScheduleIds = query.classScheduleIds;
    }

    if (endDate) {
      params.endDate = endDate;
    }

    if (endDate) {
      params.endDate = endDate;
    }
    return params;
  }

  parseHeaders(headers: any, query: any) {
    const {studioId} = query;
    const _headers = _.cloneDeep(headers);

    if (this.setFree) {
      if (studioId) {
        _headers.SiteId = studioId;
      }
    } else {
      if (studioId) {
        _headers.SiteId = 44717;
      }
    }

    return _headers;
  }

  async getUserToken(SiteId) {
    const data = {username: this.username, password: this.password};
    try {
      const response = await this.httpService.axiosRef.post(
        `${this.mbUrl}usertoken/issue`,
        data,
        {
          headers: {
            ...this.headers,
            SiteId,
          },
        }
      );

      if (response.status === 200) {
        const accessToken = _.get(response, 'data.AccessToken');
        console.log('getUserToken SiteId', SiteId);
        return accessToken;
      }
    } catch (error) {
      return this.errorHandle(error);
    }
  }

  // async setStudioId(stdudioId) {
  //   if (this.setFree) {
  //     this.headers.SiteId = stdudioId;
  //   } else {
  //     this.headers.SiteId = 44717;
  //   }
  // }

  async getClassDescriptions(query) {
    const params = this.toMbParams(query);
    const headers = this.parseHeaders(this.headers, query);

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
    const params = this.toMbParams(query);

    const Authorization = await this.getUserToken(query.studioId);

    const headers = this.parseHeaders(this.headers, query);

    try {
      const response = await this.httpService.axiosRef.get(
        `${this.mbUrl}sale/products`,
        {
          headers: {
            ...headers,
            Authorization,
            SiteId: query.studioId,
          },
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
    const params = this.toMbParams(query);
    const headers = this.parseHeaders(this.headers, query);

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
    const params = this.toMbParams(query);
    const headers = this.parseHeaders(this.headers, query);

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
    const params = this.toMbParams(query);
    const headers = this.parseHeaders(this.headers, query);

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
    const Authorization = await this.getUserToken(query.studioId);
    const params = this.toMbParams(query);
    const headers = this.parseHeaders(this.headers, query);

    try {
      const response = await this.httpService.axiosRef.get(
        `${this.mbUrl}client/clients`,
        {
          headers: {
            ...headers,
            Authorization,
            SiteId: query.studioId,
          },
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

      const endDate = moment(_sch.EndDate);
      const endOf2023 = moment('2023-12-31').toISOString();

      let resp;
      if (endDate.isAfter(endOf2023)) {
        resp = await this.endClassSchduleById(params, endDate);
      } else {
        resp = await this.endClassFeatureSchduleById(params);
      }

      results.push(resp);
    }
    return results;
  }

  async stopClassSchedulesByClass(query) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any[] = [];

    const {data} = await this.getClasses(query);

    const studioId = query.studioId;
    // const schEndDate = moment().add(2, 'years').endOf('years').toISOString();
    // for (const _class of []) {
    const total = data.Classes.length;
    let current = 0;
    for (const _class of data.Classes) {
      const {Id} = _class;

      const rmSchParams = {
        studioId,
        ClassID: Id,
        HideCancel: true,
      };
      // await sleep(1000);

      const resp = await this.cancelClass(rmSchParams);
      current++;
      console.log(new Date().toLocaleString());
      console.log(rmSchParams);
      console.log(`${current}/${total}`);

      results.push(resp);
    }

    return {
      length: results.length,
      results,
    };
  }

  async getClassSchedules(query) {
    const params = this.toMbParams(query);
    const headers = this.parseHeaders(this.headers, query);

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
    const params = this.toMbParams(query);
    const headers = this.parseHeaders(this.headers, query);
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

  async getResourcesAvailabilities(query) {
    const params = this.toMbParams(query);
    const Authorization = await this.getUserToken(query.studioId);

    let headers = this.parseHeaders(this.headers, query);
    headers = {
      ...headers,
      Authorization,
      SiteId: query.studioId,
    };

    console.log(headers);
    console.log(params);

    try {
      const response = await this.httpService.axiosRef.get(
        `${this.mbUrl}/site/resourceavailabilities`,
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
    const params = this.toMbParams(query);
    const Authorization = await this.getUserToken(query.studioId);
    const headers = this.parseHeaders(this.headers, query);

    try {
      const response = await this.httpService.axiosRef.get(
        `${this.mbUrl}site/resources`,
        {
          headers: {
            ...headers,
            Authorization,
            SiteId: query.studioId,
          },
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

  async getPrograms(query) {
    const params = this.toMbParams(query);
    const Authorization = await this.getUserToken(query.studioId);

    const headers = this.parseHeaders(this.headers, query);

    try {
      const response = await this.httpService.axiosRef.get(
        `${this.mbUrl}site/programs`,
        {
          headers: {
            ...headers,
            Authorization,
            SiteId: query.studioId,
          },
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

  async getPricingoptions(query) {
    const params = this.toMbParams(query);
    const Authorization = await this.getUserToken(query.studioId);

    const headers = this.parseHeaders(this.headers, query);

    try {
      const response = await this.httpService.axiosRef.get(
        `${this.mbUrl}pricingoption/pricingoptions`,
        {
          headers: {
            ...headers,
            Authorization,
            SiteId: query.studioId,
          },
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

  async getPaymenttypes(query) {
    const params = this.toMbParams(query);
    const Authorization = await this.getUserToken(query.studioId);

    const headers = this.parseHeaders(this.headers, query);

    try {
      const response = await this.httpService.axiosRef.get(
        `${this.mbUrl}site/paymenttypes`,
        {
          headers: {
            ...headers,
            Authorization,
            SiteId: query.studioId,
          },
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
    const Authorization = await this.getUserToken(data.studioId);
    const {schedule} = data;

    const _schedule = {...schedule};
    // const _schedule = {...schedule, LocationId: 3};

    const headers = this.parseHeaders(this.headers, data);
    try {
      const response = await this.httpService.axiosRef.post(
        `${this.mbUrl}class/addclassschedule`,
        _schedule,
        {
          headers: {
            ...headers,
            Authorization,
            SiteId: data.studioId,
          },
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

  async cancelClass(query: any) {
    const Authorization = await this.getUserToken(query.studioId);

    // this is class instance id;
    const data = {
      ClassID: query.ClassID,
      HideCancel: query.HideCancel,
    };

    let headers = this.parseHeaders(this.headers, data);

    headers = {
      ...headers,
      Authorization,
      SiteId: query.studioId,
    };
    try {
      const response = await this.httpService.axiosRef.post(
        `${this.mbUrl}class/cancelsingleclass`,
        data,
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

  async endClassSchduleById(data: endClassScheduleDto, EndDate) {
    const schedule = {
      ClassId: data.scheduleId,
      EndDate: EndDate,
    };
    const params = {...data, schedule};

    return this.updateClassSchedule(params);
  }

  async endClassFeatureSchduleById(data: endClassScheduleDto) {
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

  async endClassFeatureSchduleByQuerySch(schParams) {
    const {studioId, locationId, scheduleId: classScheduleIds} = schParams;
    const schEndDate = moment().add(2, 'years').toISOString();
    schParams.endDate = schEndDate;

    const schResp = await this.getClassSchedules(schParams);

    const _sch = _.get(schResp, 'data.ClassSchedules[0]');

    const rmSchParams = {
      studioId,
      locationId,
      scheduleId: classScheduleIds,
    };

    const endDate = moment(_sch.EndDate);
    const startDate = moment(_sch.StartDate);

    const endOf2023 = moment('2023-12-31').endOf('year');
    const endOf2023_string = endOf2023.toISOString();

    let resp: any = {};

    if (endDate.isAfter(endOf2023) && startDate.isBefore(endOf2023)) {
      resp = await this.endClassSchduleById(rmSchParams, endOf2023_string);
    } else {
      resp = await this.endClassFeatureSchduleById(rmSchParams);
    }

    return resp;
  }

  async updateClassSchedule(data: AddClassScheduleDto) {
    const Authorization = await this.getUserToken(data.studioId);
    const headers = this.parseHeaders(this.headers, data);
    const {schedule} = data;
    const _schedule = {...schedule};

    try {
      console.log(headers);
      console.log(_schedule);

      const response = await this.httpService.axiosRef.post(
        `${this.mbUrl}class/updateclassschedule`,
        _schedule,
        {
          headers: {
            ...headers,
            Authorization,
            SiteId: data.studioId,
          },
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

  async deleteFromMboById(eventId: number) {
    const event = await this.prisma.event.findFirstOrThrow({
      where: {
        id: eventId,
      },
      include: {
        venue: true,
      },
    });

    const ClassInstanceIds = _.get(
      event,
      'mboData.resp.mboResp.data.ClassInstanceIds[0]'
    );
    if (ClassInstanceIds) {
      const studioId = _.get(event, 'venue.external_studioId');
      const parmas = {
        studioId,
        ClassID: ClassInstanceIds,
        HideCancel: true,
      };
      const resp = await this.cancelClass(parmas);
      return resp.success;
    } else {
      return false;
    }
  }
  /* End */
}
