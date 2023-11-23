import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {MindbodyService} from './mindbody.service';
import {AddClassScheduleDto} from './mindbody.dto';
import * as moment from 'moment';
import * as _ from 'lodash';
import {datetimeToDaySec, groupClassesByDate} from './util';
import {UserService} from '@microservices/account/user/user.service';
import {SnowflakeService} from '@toolkit/snowflake/snowflake.service';

enum ClassHandle {
  None = 'None',
  Add = 'Add',
  Update = 'Update',
  Remove = 'Remove',
}

@Injectable()
export class ScToMbService {
  private event: any;
  classHandle = ClassHandle.None;
  currentClass;
  updateScheduleId;
  checkResult: any;
  needAdd = false;

  constructor(
    private mindbodyService: MindbodyService,
    private userService: UserService,
    private snowflakeService: SnowflakeService
  ) {}

  init() {
    this.checkResult = {
      success: false,
      message: '',
    };
  }

  getResult() {
    return {
      ...this.checkResult,
      classHandle: this.classHandle,
      needAdd: this.needAdd,
      event: this.event,
    };
  }
  async eventPublish(event) {
    this.event = event;

    this.init();
    await this.getNewClassByEvent();
    if (!this.checkResult.success) {
      return {
        classHandle: this.classHandle,
        ...this.checkResult,
      };
    }
    await this.classCheck();

    if (!this.checkResult.success) {
      return {
        classHandle: this.classHandle,
        ...this.checkResult,
      };
    }

    if (this.classHandle === ClassHandle.Add) {
      const resp = await this.mindbodyService.addClassSchedule(
        this.currentClass
      );
      if (!resp.success) {
        this.checkResult.success = false;
        this.checkResult.data = resp.data;
        this.checkResult.message = 'Add Failed';
      }
      this.checkResult.success = true;
    } else {
      if (this.needAdd) {
        const resp = await this.mindbodyService.addClassSchedule(
          this.currentClass
        );
        if (!resp.success) {
          this.checkResult.success = false;
          this.checkResult.data = resp.data;
          this.checkResult.message = 'Add For Update Failed';
        }
      }

      const udpateClassParams = _.cloneDeep(this.currentClass);

      udpateClassParams.schedule.ClassId = this.updateScheduleId;

      const resp =
        await this.mindbodyService.updateClassSchedule(udpateClassParams);

      if (!resp.success) {
        this.checkResult.success = false;
        this.checkResult.data = resp.data;
        this.checkResult.message = 'Update failed';
      }

      this.checkResult.success = true;
      this.checkResult.message = 'Update Success';
    }
  }

  praseClassToUpdate() {}

  async classCheck() {
    const {changeLogs} = this.event;

    if (!changeLogs || changeLogs.length === 0) {
      this.checkResult.message = 'Missing ChangeLogs for event';
      return;
    }

    const changeLogDes = changeLogs.map((d: any) => d.description);

    const newClassPrefix = 'New class';
    if (changeLogDes.indexOf(newClassPrefix) > -1) {
      this.classHandle = ClassHandle.Add;
    } else {
      this.classHandle = ClassHandle.Update;
    }

    const {datetimeOfStart, datetimeOfEnd, venue} = this.event;
    const {external_studioId: studioId, external_locationId: LocationId} =
      venue;

    const startDateTime = moment(datetimeOfStart).startOf('day').toISOString();
    const endDateTime = moment(datetimeOfEnd).endOf('day').toISOString();

    const params = {
      page: 1,
      pageSize: 100,
      studioId,
      LocationId,
      startDateTime,
      endDateTime,
    };
    const classesResp = await this.mindbodyService.getClasses(params);

    if (classesResp.success) {
      const {Classes: cs} = classesResp.data;

      if (cs.length === 0) {
        return;
      }

      const filtedCs = _.filter(cs, (c: any) => {
        const _resourceId = _.get(c, 'Resource.Id');
        return _resourceId === this.currentClass.schedule.ResourceId;
      });

      const groupCs = groupClassesByDate(filtedCs);

      const dates = Object.keys(groupCs);

      const {StartTime, EndTime} = this.currentClass.schedule;

      const _startTimeSec = datetimeToDaySec(StartTime);
      const _endTimeSec = datetimeToDaySec(EndTime);

      for (const classdate of dates) {
        const _classes = groupCs[classdate];

        if (this.classHandle === ClassHandle.Add) {
          const duplicateClass = _.filter(_classes, (c: any) => {
            if (c.startSec > _endTimeSec && c.endSec > _endTimeSec) {
              return false;
            }
            if (c.startSec < _startTimeSec && c.endSec < _startTimeSec) {
              return false;
            }
            return true;
          });

          if (duplicateClass.length > 0) {
            this.checkResult.message = 'Classes duplicate';
            this.checkResult.duplicatedClass = duplicateClass;
            return;
          }

          this.checkResult.success = true;
        }

        if (this.classHandle === ClassHandle.Update) {
          const duplicateClass = _.filter(_classes, (c: any) => {
            if (c.startSec > _endTimeSec && c.endSec > _endTimeSec) {
              return false;
            }
            if (c.startSec < _startTimeSec && c.endSec < _startTimeSec) {
              return false;
            }
            return true;
          });

          const includeClass = _.filter(_classes, (c: any) => {
            if (c.startSec >= _startTimeSec && c.endSec <= _endTimeSec) {
              return true;
            }
            return false;
          });

          if (duplicateClass.length >= 2) {
            this.checkResult.message = 'Classes duplicate';
            this.checkResult.duplicatedClass = duplicateClass;
            return;
          }

          if (duplicateClass.length === 0) {
            this.needAdd = true;
            this.checkResult.success = true;
          }

          if (duplicateClass.length === 1) {
            this.updateScheduleId = duplicateClass[0].ClassScheduleId;
            this.checkResult.success = true;
          }
        }
      }
    } else {
      this.checkResult.message = 'Query existed classes error';
      return;
    }
  }

  async getNewClassByEvent() {
    const {
      ClassDescriptionId = 69,
      datetimeOfStart,
      datetimeOfEnd,
      dayOfWeek,
      venue,
    } = this.event;

    const {external_studioId: studioId, external_locationId: LocationId} =
      venue;

    const StartDate = moment(datetimeOfStart)
      .startOf('day')
      .toISOString()
      .replace('.000', '')
      .replace('Z', '');
    const EndDate = moment(datetimeOfEnd)
      .endOf('day')
      .toISOString()
      .replace('.000', '')
      .replace('Z', '');

    const StartTime = moment(datetimeOfStart)
      .toISOString()
      .replace('.000', '')
      .replace('Z', '');
    const EndTime = moment(datetimeOfEnd)
      .toISOString()
      .replace('.000', '')
      .replace('Z', '');

    const weekdays = {
      DaySunday: false,
      DayMonday: false,
      DayTuesday: false,
      DayWednesday: false,
      DayThursday: false,
      DayFriday: false,
      DaySaturday: false,
    };

    switch (dayOfWeek) {
      case 0:
        weekdays.DaySunday = true;
        break;
      case 1:
        weekdays.DayMonday = true;
        break;
      case 2:
        weekdays.DayTuesday = true;
        break;
      case 3:
        weekdays.DayWednesday = true;
        break;
      case 4:
        weekdays.DayThursday = true;
        break;
      case 5:
        weekdays.DayFriday = true;
        break;
      case 6:
        weekdays.DaySaturday = true;
        break;
      default:
        break;
    }

    const params = {
      page: 1,
      pageSize: 200,
      studioId,
      locationIds: LocationId,
    };
    // const resources = await this.mindbodyService.getResources(params);
    // console.log(resources);
    const classDessResp =
      await this.mindbodyService.getClassDescriptions(params);

    const classDess = _.get(classDessResp, 'data.ClassDescriptions');

    const acitived_classDess = classDess.filter((d: any) => {
      return d.Active;
    });

    // const classname = _.get(this.event, 'type.name');
    const classname = 'Power Yoga';

    const _classDes = _.find(acitived_classDess, (d: any) => {
      return d.Name === classname;
    });

    if (!_classDes) {
      this.checkResult.success = false;
      this.checkResult.message = `Can't find class description by Class Name ${classname}`;
      return;
    }

    const ResourceId = _classDes.Id;

    const {hostUserId} = this.event;

    const staff = await this.userService.findUnique({where: {id: hostUserId}});

    if (!staff) {
      this.checkResult.success = false;
      this.checkResult.message = `Can't find user by user id ${hostUserId}`;
      return;
    }

    const {email} = staff;

    const staff_params = {
      studioId,
      locationId: LocationId,
      email,
    };

    // Query staff
    const sqlText = `
        select clientid,studioid,location
        from clients
        where emailname = ?
        and studioid = ?
        and location = ?    
      `;
    const executeOpt = {
      sqlText,
      binds: [
        staff_params.email,
        staff_params.studioId,
        staff_params.locationId,
      ],
    };
    const data: any = await this.snowflakeService.execute(executeOpt);
    const sf_staff = {
      data,
      count: data.length,
    };

    console.log(sf_staff);

    const _class: AddClassScheduleDto = {
      studioId: studioId,
      schedule: {
        ClassDescriptionId,
        LocationId,
        StartDate,
        EndDate,
        StartTime,
        EndTime,
        ...weekdays,
        StaffId: 100000011,
        StaffPayRate: 1,
        ResourceId,
        MaxCapacity: 10,
        WebCapacity: 10,
        WaitlistCapacity: 10,
        BookingStatus: 'Free',
        AllowDateForwardEnrollment: true,
        AllowOpenEnrollment: true,
        PricingOptionsProductIds: [1],
      },
    };

    this.currentClass = _class;
  }
}
