/* eslint-disable @typescript-eslint/no-explicit-any */
import {Injectable} from '@nestjs/common';
import {MindbodyService} from './mindbody.service';
import {AddClassScheduleDto} from './mindbody.dto';
import * as moment from 'moment';
import * as _ from 'lodash';
import {datetimeToDaySec, getWeekdays, groupClassesByDate} from './util';
import {UserService} from '@microservices/account/user/user.service';
import {RawDataCoachService} from '../raw-data/raw-data-coach.service';

enum ClassHandle {
  None = 'None',
  Add = 'Add',
  Update = 'Update',
  Remove = 'Remove',
}

@Injectable()
export class ScToMbService {
  private event: any;
  step = 'init';
  classHandle = ClassHandle.None;
  currentClass;
  updateScheduleId;
  dropSchduleId;
  checkResult: any;
  needAdd = false;
  selectedScheduleId;
  bodyOption: any;
  removeClassIds: any = [];
  studioId;
  locationId;

  constructor(
    private mindbodyService: MindbodyService,
    private userService: UserService,
    private rawDataCoachService: RawDataCoachService
  ) {}

  init() {
    this.checkResult = {
      success: true,
      message: '',
    };
  }

  parseBodyEvent({event, body}) {
    const {venue} = event;
    const StaffPayRate = venue.external_staffPayRate;
    const ResourceId = venue.external_resourceId;
    const MaxCapacity = venue.external_maxCapacity;
    const WebCapacity = venue.external_webCapacity;
    const WaitlistCapacity = venue.external_waitlistCapacity;
    const BookingStatus = venue.external_bookingStatus;
    const AllowDateForwardEnrollment =
      venue.external_allowDateForwardEnrollment;
    const AllowOpenEnrollment = venue.external_allowOpenEnrollment;
    const PricingOptionsProductIds = venue.external_pricingOptionsProductIds;

    const _event: any = {
      ...event,
    };

    if (_event && _event.venue) {
      _event.venue.external_studioId = 44717;
      _event.venue.external_locationId = 3;
      _event.datetimeOfStart =
        moment()
          .year(event.year)
          .month(event.month - 1)
          .date(event.dayOfMonth)
          .hour(event.hour)
          .minute(event.minute)
          .second(0)
          .format('YYYY-MM-DDTHH:mm:ss') + 'Z';

      _event.datetimeOfEnd =
        moment()
          .year(event.year)
          .month(event.month - 1)
          .date(event.dayOfMonth)
          .hour(event.hour)
          .minute(event.minute)
          .second(0)
          .add(event.minutesOfDuration, 'minutes')
          .format('YYYY-MM-DDTHH:mm:ss') + 'Z';

      // _event.datetimeOfStart = '2024-04-04T07:00:00Z';
      // _event.datetimeOfEnd = '2024-04-04T07:45:00Z';
      // _event.year = 2024;
      // _event.month = 4;
      // _event.dayOfMonth = 4;
    }

    this.studioId = _.get(_event, 'venue.external_studioId');
    this.locationId = _.get(_event, 'venue.external_locationId');

    const _body = {
      StaffPayRate,
      ResourceId,
      MaxCapacity,
      WebCapacity,
      WaitlistCapacity,
      BookingStatus,
      AllowDateForwardEnrollment,
      AllowOpenEnrollment,
      PricingOptionsProductIds,
      // _StaffId: 100000799,
      ...body,
    };

    // const _body = {
    //   StaffPayRate: 1,
    //   ResourceId: 2,
    //   MaxCapacity: 10,
    //   WebCapacity: 10,
    //   WaitlistCapacity: 10,
    //   BookingStatus: 'Free',
    //   AllowDateForwardEnrollment: true,
    //   AllowOpenEnrollment: true,
    //   PricingOptionsProductIds: [1],
    //   _StaffId: 100000799,
    //   ...body,
    // };

    return {
      _body,
      _event,
    };
  }

  getResult() {
    return {
      step: this.step,
      ...this.checkResult,
      classHandle: this.classHandle,
      needAdd: this.needAdd,
      event: this.event,
      currentClass: this.currentClass,
      dropSchduleId: this.dropSchduleId,
      updateScheduleId: this.updateScheduleId,
    };
  }

  setCheckResult(result) {
    this.step = result.step;
    this.checkResult = {
      success: result.success,
      message: result.message,
      duplicatedClass: result.duplicatedClass,
    };
    this.classHandle = result.classHandle;
    this.needAdd = result.needAdd;
    this.event = result.event;
    this.currentClass = result.currentClass;
    this.dropSchduleId = result.dropSchduleId;
    this.updateScheduleId = result.dropSchduleId;
  }

  async eventCheck(event, options) {
    const {selectedScheduleId} = options;
    this.bodyOption = options;

    if (selectedScheduleId) {
      this.selectedScheduleId = selectedScheduleId;
    }
    this.event = event;

    this.init();
    this.step = 'getNewClassByEvent';
    await this.getNewClassByEvent();
    if (!this.checkResult.success) {
      return;
    }
    this.step = 'classCheck';
    await this.classCheck();

    if (!this.checkResult.success) {
      return;
    }
  }

  async eventPublish() {
    this.step = 'MB Request';
    if (this.classHandle === ClassHandle.Add) {
      const resp = await this.mindbodyService.addClassSchedule(
        this.currentClass
      );
      if (!resp.success) {
        this.checkResult.success = false;
        this.checkResult.data = resp.data;
        this.checkResult.message = 'Add Failed';
        return;
      }
      this.checkResult.success = true;
    }

    if (this.classHandle === ClassHandle.Update) {
      if (this.needAdd) {
        const resp = await this.mindbodyService.addClassSchedule(
          this.currentClass
        );
        if (!resp.success) {
          this.checkResult.success = false;
          this.checkResult.data = resp.data;
          this.checkResult.message = 'Add For Update Failed';
          return;
        }

        this.checkResult.message = 'Add For Update Success';
        this.checkResult.success = true;
      } else {
        if (this.dropSchduleId) {
          const endParams = {
            studioId: -99,
            locationId: 1,
            scheduleId: this.dropSchduleId,
          };

          const endResp =
            await this.mindbodyService.endClassSchduleById(endParams);
          console.log('endResp', endResp);
        }

        const udpateClassParams = _.cloneDeep(this.currentClass);

        udpateClassParams.schedule.ClassId = this.updateScheduleId;

        const resp =
          await this.mindbodyService.updateClassSchedule(udpateClassParams);

        if (!resp.success) {
          this.checkResult.success = false;
          this.checkResult.data = resp.data;
          this.checkResult.message = 'Update failed';
          return;
        }

        this.checkResult.message = 'Update Success';
        this.checkResult.success = true;
      }
    }

    if (this.classHandle === ClassHandle.Remove) {
      if (this.removeClassIds.length > 0) {
        for (const _schId of this.removeClassIds) {
          const params = {
            studioId: this.currentClass.schduleId,
            locationId: this.currentClass.schedule.LocationId,
            scheduleId: _schId,
          };
          const resp = await this.mindbodyService.endClassSchduleById(params);
          if (!resp.success) {
            this.checkResult.success = false;
            this.checkResult.data = resp.data;
            this.checkResult.message = 'Add Failed';
            return;
          }
        }
      }

      this.checkResult.success = true;
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
    const changeLogDesString = changeLogDes.join(' ');

    const newClassPrefix = 'New class';
    const removeClassPrefix = 'Remove class';

    this.classHandle = ClassHandle.Update;

    if (changeLogDesString.indexOf(newClassPrefix) > -1) {
      this.classHandle = ClassHandle.Add;
    }

    if (changeLogDesString.indexOf(removeClassPrefix) > -1) {
      this.classHandle = ClassHandle.Remove;
    }

    const {venue, year, month, dayOfMonth} = this.event;
    const {external_studioId: studioId, external_locationId: LocationId} =
      venue;

    const classDate = moment()
      .year(year)
      .month(month - 1)
      .date(dayOfMonth)
      .format('YYYY-MM-DD');
    const startDateTime = moment(classDate).startOf('day').format('YYYY-MM-DD');
    const endDateTime = moment(classDate).endOf('day').format('YYYY-MM-DD');

    const params = {
      page: 1,
      pageSize: 1000,
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

      if (filtedCs.length === 0) {
        this.needAdd = true;
        this.checkResult.success = true;
      }

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

          if (duplicateClass.length >= 2) {
            const duplicateClassIds = duplicateClass.map(
              (d: any) => d.ClassScheduleId
            );

            if (this.selectedScheduleId) {
              const differenceArray = _.difference(duplicateClassIds, [
                this.selectedScheduleId,
              ]);
              this.dropSchduleId = differenceArray[0];
              this.updateScheduleId = this.selectedScheduleId;
              this.checkResult.success = true;
            } else {
              this.checkResult.message = 'Classes duplicate';
              this.checkResult.duplicatedClass = duplicateClass;
              this.checkResult.success = false;
              return;
            }
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

        if (this.classHandle === ClassHandle.Remove) {
          const duplicateClass = _.filter(_classes, (c: any) => {
            if (c.startSec > _endTimeSec && c.endSec > _endTimeSec) {
              return false;
            }
            if (c.startSec < _startTimeSec && c.endSec < _startTimeSec) {
              return false;
            }
            return true;
          });

          this.removeClassIds = duplicateClass.map(d => d.ClassScheduleId);
          this.checkResult.success = true;
        }
      }
    } else {
      this.checkResult.message = 'Query existed classes error';
      return;
    }
  }

  async getNewClassByEvent() {
    const {datetimeOfStart, datetimeOfEnd, venue} = this.event;

    const {external_studioId: studioId, external_locationId: LocationId} =
      venue;

    let StartDate = datetimeOfStart;
    let EndDate = datetimeOfEnd;

    let StartTime = moment(datetimeOfStart)
      .toISOString()
      .replace('.000', '')
      .replace('Z', '');
    let EndTime = moment(datetimeOfEnd)
      .toISOString()
      .replace('.000', '')
      .replace('Z', '');
    const _dayOfWeek = moment(datetimeOfStart).weekday();
    let weekdays = getWeekdays(_dayOfWeek);
    const params = {
      page: 1,
      pageSize: 200,
      studioId,
      locationIds: LocationId,
    };
    // const resources = await this.mindbodyService.getResources(params);
    const classDessResp =
      await this.mindbodyService.getClassDescriptions(params);

    const classDess = _.get(classDessResp, 'data.ClassDescriptions');

    const acitived_classDess = classDess.filter((d: any) => {
      return d.Active;
    });

    //test data
    const classname = 'Full Body';

    const _classDes = _.find(acitived_classDess, (d: any) => {
      return d.Name === classname;
    });

    if (!_classDes) {
      this.checkResult.success = false;
      this.checkResult.message = `Can't find class description by Class Name ${classname}`;
      return;
    }

    const ClassDescriptionId = _classDes.Id;
    // const ResourceId = _classDes.Id;

    const {hostUserId} = this.event;

    const staff = await this.userService.findUnique({where: {id: hostUserId}});

    if (!staff) {
      this.checkResult.success = false;
      this.checkResult.message = `Can't find user by user id ${hostUserId}`;
      return;
    }

    // const {email} = staff;

    const email = 'anthony@solidcore.co';

    const staff_params = {
      studioId,
      locationId: LocationId,
      email,
    };

    const sf_staff_resp =
      await this.rawDataCoachService.queryStaff(staff_params);

    const sf_staff = _.get(sf_staff_resp, 'data[0]');

    if (!sf_staff) {
      this.checkResult.success = false;
      this.checkResult.message = `Can't find user from snowflake by user id ${staff_params}`;
      return;
    }

    let StaffId = _.get(sf_staff, 'TRAINERID');

    //test data
    const {
      ResourceId,
      StaffPayRate,
      MaxCapacity,
      WebCapacity,
      WaitlistCapacity,
      BookingStatus,
      AllowDateForwardEnrollment,
      AllowOpenEnrollment,
      PricingOptionsProductIds,
      _StartDate,
      _EndDate,
      _StartTime,
      _EndTime,
      _StaffId,
    } = this.bodyOption;

    if (_StartDate) {
      const _dayOfWeek = moment(_StartDate).weekday();
      weekdays = getWeekdays(_dayOfWeek);
      StartDate = _StartDate;
    }
    if (_EndDate) {
      EndDate = _EndDate;
    }
    if (_StartTime) {
      StartTime = _StartTime;
    }
    if (_EndTime) {
      EndTime = _EndTime;
    }

    if (_StaffId) {
      StaffId = _StaffId;
    }

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
        StaffId,
        StaffPayRate,
        ResourceId,
        MaxCapacity,
        WebCapacity,
        WaitlistCapacity,
        BookingStatus,
        AllowDateForwardEnrollment,
        AllowOpenEnrollment,
        PricingOptionsProductIds,
      },
    };

    this.currentClass = _class;
    this.checkResult.success = true;
  }
}
