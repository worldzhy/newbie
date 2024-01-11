/* eslint-disable @typescript-eslint/no-explicit-any */
import {MindbodyService} from './mindbody.service';
import {AddClassScheduleDto} from './mindbody.dto';
import * as moment from 'moment';
import * as _ from 'lodash';
import {
  compareObjects,
  datetimeToDaySec,
  getWeekdays,
  groupClassesByDate,
} from './util';
import {ConfigService} from '@nestjs/config';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {RawDataCoachService} from '../raw-data/raw-data-coach.service';

enum ClassHandle {
  None = 'None',
  Add = 'Add',
  Update = 'Update',
  Remove = 'Remove',
}

export class ScToMbService2 {
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
  mboResp: any;
  removeClassIds: any = [];
  studioId;
  locationId;
  setFree;
  classDescriptionList: any = [];
  test: any = {};

  constructor(
    private readonly prisma: PrismaService,
    private mindbodyService: MindbodyService,
    private rawDataCoachService: RawDataCoachService
  ) {}

  init() {
    this.checkResult = {
      success: true,
      message: '',
    };
  }

  async parseBodyEvent({event, body}) {
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
    // const PricingOptionsProductIds = venue.external_pricingOptionsProductIds;

    const PricingOptionsProductIds = [];
    const updateFields: any = {};

    let _event: any = {
      ...event,
    };

    if (event.isPublished) {
      const {event: UpdEvent} = body;

      if (UpdEvent) {
        const typeId = UpdEvent.typeId;

        const classType = await this.prisma.eventType.findUniqueOrThrow({
          where: {id: typeId},
        });

        _event = {
          ..._event,
          ...UpdEvent,
          minutesOfDuration: classType.minutesOfDuration,
          type: classType,
        };
      }
    }
    if (_event && _event.venue) {
      _event.datetimeOfStart =
        moment()
          .year(_event.year)
          .month(_event.month - 1)
          .date(_event.dayOfMonth)
          .hour(_event.hour)
          .minute(_event.minute)
          .second(0)
          .format('YYYY-MM-DDTHH:mm:ss') + 'Z';

      _event.datetimeOfEnd =
        moment()
          .year(_event.year)
          .month(_event.month - 1)
          .date(_event.dayOfMonth)
          .hour(_event.hour)
          .minute(_event.minute)
          .second(0)
          .add(_event.minutesOfDuration, 'minutes')
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
      ...updateFields,
    };

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
      mboResp: this.mboResp,
      classDescriptionList: this.classDescriptionList,
      test: this.test,
    };
  }

  getMboResult() {
    return {
      step: this.step,
      ...this.checkResult,
      classHandle: this.classHandle,
      needAdd: this.needAdd,
      currentClass: this.currentClass,
      dropSchduleId: this.dropSchduleId,
      updateScheduleId: this.updateScheduleId,
      mboResp: this.mboResp,
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
      this.mboResp = resp;
      if (!resp.success) {
        this.checkResult.success = false;
        this.checkResult.data = resp.data;
        this.checkResult.message = _.get(resp, 'data.Message') || 'Add Failed';
        return;
      }
      this.checkResult.message = 'Add Success';
      this.checkResult.success = true;
    }

    if (this.classHandle === ClassHandle.Update) {
      if (this.needAdd) {
        const resp = await this.mindbodyService.addClassSchedule(
          this.currentClass
        );
        this.mboResp = resp;

        if (!resp.success) {
          this.checkResult.success = false;
          this.checkResult.data = resp.data;
          this.checkResult.message = this.checkResult.message =
            _.get(resp, 'data.Message') || 'Add For Update Failed';
          return;
        }

        this.checkResult.message = 'Add For Update Success';
        this.checkResult.success = true;
      } else {
        // if (this.dropSchduleId) {
        //   const endParams = {
        //     studioId: this.studioId,
        //     locationId: this.locationId,
        //     scheduleId: this.dropSchduleId,
        //   };

        //   const endResp =
        //     await this.mindbodyService.endClassFeatureSchduleByQuerySch(
        //       endParams
        //     );
        //   console.log('endResp', endResp);
        // }

        // const udpateClassParams = _.cloneDeep(this.currentClass);

        // udpateClassParams.schedule.ClassId = this.updateScheduleId;

        // const resp =
        //   await this.mindbodyService.updateClassSchedule(udpateClassParams);
        // this.mboResp = resp;
        // if (!resp.success) {
        //   this.checkResult.success = false;
        //   this.checkResult.data = resp.data;
        //   this.checkResult.message = 'Update failed';
        //   return;
        // }

        if (this.updateScheduleId) {
          this.checkResult.message = `Duplcate ClassSchedule to Id: ${this.updateScheduleId} `;
          this.checkResult.success = false;
        } else {
          this.checkResult.message = 'Update Success';
          this.checkResult.success = true;
        }
      }
    }

    if (this.classHandle === ClassHandle.Remove) {
      // if (this.removeClassIds.length > 0) {
      //   for (const _schId of this.removeClassIds) {
      //     const params = {
      //       studioId: this.currentClass.schduleId,
      //       locationId: this.currentClass.schedule.LocationId,
      //       scheduleId: _schId,
      //     };
      //     const resp =
      //       await this.mindbodyService.endClassFeatureSchduleByQuerySch(params);
      //     if (!resp.success) {
      //       this.checkResult.success = false;
      //       this.checkResult.data = resp.data;
      //       this.checkResult.message = 'Add Failed';
      //       return;
      //     }
      //   }
      // }
      this.checkResult.message = 'Remove Success';
      this.checkResult.success = true;
    }
  }

  async eventUpdate(event) {
    this.step = 'MB Request';
    const newCurrentClass = _.cloneDeep(this.currentClass);
    const oldSchedule = _.get(event, 'mboData.resp.currentClass.schedule');
    const newSchedule = newCurrentClass.schedule;
    const studioId = newCurrentClass.studioId;

    const schDiff = compareObjects(newSchedule, oldSchedule);
    const ClassId: number = _.get(event, 'mboData.classScheduleId');

    const udpateClassParams = {
      studioId,
      schedule: {
        ...schDiff,
        ClassId,
      },
    };

    const resp =
      await this.mindbodyService.updateClassSchedule(udpateClassParams);

    this.mboResp = resp;
    if (!resp.success) {
      this.checkResult.success = false;
      this.checkResult.data = resp.data;
      this.checkResult.message = 'Update failed';
      return;
    }
    this.checkResult.message = 'Update Success';
    this.checkResult.success = true;
  }

  praseClassToUpdate() {}

  async classCheck() {
    // const {changeLogs} = this.event;

    // if (!changeLogs || changeLogs.length === 0) {
    //   this.checkResult.message = 'Missing ChangeLogs for event';
    //   return;
    // }

    // const changeLogDes = changeLogs.map((d: any) => d.description);
    // const changeLogDesString = changeLogDes.join(' ');

    // const newClassPrefix = 'New class';
    // const removeClassPrefix = 'Remove class';

    this.classHandle = ClassHandle.Add;

    // if (changeLogDesString.indexOf(newClassPrefix) > -1) {
    //   this.classHandle = ClassHandle.Add;
    // }

    // if (changeLogDesString.indexOf(removeClassPrefix) > -1) {
    //   this.classHandle = ClassHandle.Remove;
    // }

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
      locationIds: LocationId,
      startDateTime,
      endDateTime,
    };

    const classesResp = await this.mindbodyService.getClasses(params);

    if (classesResp.success) {
      const {Classes: cs} = classesResp.data;

      if (cs.length === 0) {
        this.needAdd = true;
        this.checkResult.success = true;
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

        // if (this.classHandle === ClassHandle.Update) {
        //   const duplicateClass = _.filter(_classes, (c: any) => {
        //     if (c.startSec > _endTimeSec && c.endSec > _endTimeSec) {
        //       return false;
        //     }
        //     if (c.startSec < _startTimeSec && c.endSec < _startTimeSec) {
        //       return false;
        //     }
        //     return true;
        //   });

        //   if (duplicateClass.length >= 2) {
        //     const duplicateClassIds = duplicateClass.map(
        //       (d: any) => d.ClassScheduleId
        //     );

        //     if (this.selectedScheduleId) {
        //       const differenceArray = _.difference(duplicateClassIds, [
        //         this.selectedScheduleId,
        //       ]);
        //       this.dropSchduleId = differenceArray[0];
        //       this.updateScheduleId = this.selectedScheduleId;
        //       this.checkResult.success = true;
        //     } else {
        //       this.checkResult.message = 'Classes duplicate';
        //       this.checkResult.duplicatedClass = duplicateClass;
        //       this.checkResult.success = false;
        //       return;
        //     }
        //   }

        //   if (duplicateClass.length === 0) {
        //     this.needAdd = true;
        //     this.checkResult.success = true;
        //   }

        //   if (duplicateClass.length === 1) {
        //     this.updateScheduleId = duplicateClass[0].ClassScheduleId;
        //     this.checkResult.success = true;
        //   }
        // }

        // if (this.classHandle === ClassHandle.Remove) {
        //   const duplicateClass = _.filter(_classes, (c: any) => {
        //     if (c.startSec > _endTimeSec && c.endSec > _endTimeSec) {
        //       return false;
        //     }
        //     if (c.startSec < _startTimeSec && c.endSec < _startTimeSec) {
        //       return false;
        //     }
        //     return true;
        //   });

        //   this.removeClassIds = duplicateClass.map(d => d.ClassScheduleId);
        //   this.checkResult.success = true;
        // }
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
      locationId: LocationId,
    };
    // const resources = await this.mindbodyService.getResources(params);
    const classDessResp =
      await this.mindbodyService.getClassDescriptions(params);

    const classDess = _.get(classDessResp, 'data.ClassDescriptions');

    const acitived_classDess = classDess.filter((d: any) => {
      return d.Active;
    });

    //test data
    // const classname = 'Full Body';
    const classname = _.get(this.event, 'type.name').trim().toLowerCase();

    const aliases = _.get(this.event, 'type.aliases');

    let parsedAliases: string[] = [];
    if (aliases) {
      parsedAliases = aliases.map(d => {
        return d.trim().toLowerCase();
      });
    }

    const _classDeses = _.filter(acitived_classDess, (d: any) => {
      const _classDesName = _.trim(d.Name).toLowerCase();
      return (
        _classDesName === classname || parsedAliases.indexOf(_classDesName) > -1
      );
    });

    // this.test.desParams = params;
    // this.test.classname = classname;
    // this.test.classDessLength = classDess.length;

    if (_classDeses.length === 0) {
      this.checkResult.success = false;
      this.checkResult.message = `Can't find class description by Class Name ${classname}`;
      return;
    }

    this.classDescriptionList = _classDeses.map(d => {
      return {
        Id: _.get(d, 'Id'),
        Name: _.get(d, 'Name'),
        LastUpdated: _.get(d, 'LastUpdated'),
        Program: _.get(d, 'Program.Name'),
        ProgramId: _.get(d, 'Program.Id'),
      };
    });

    if (venue && venue.preferredProgramId) {
      this.classDescriptionList = _.sortBy(this.classDescriptionList, [
        item => item.ProgramId !== venue.preferredProgramId,
        item => item.Name.trim().toLowerCase() === classname,
        item => -new Date(item.LastUpdated).getTime(),
      ]);
    } else {
      this.classDescriptionList = _.reverse(
        _.sortBy(this.classDescriptionList, [
          item => item.Name.trim().toLowerCase() === classname,
          item => new Date(item.LastUpdated),
        ])
      );
    }

    const _classDes = this.classDescriptionList[0];
    const ClassDescriptionId = _classDes.Id;
    // const ResourceId = _classDes.Id;

    const {hostUserId} = this.event;

    if (!hostUserId) {
      this.checkResult.success = false;
      this.checkResult.message =
        'The coach of this event did not set up correctly.';
      return;
    }

    const staff = await this.prisma.user.findUnique({
      where: {id: hostUserId},
      include: {
        profile: true,
      },
    });

    if (!staff) {
      this.checkResult.success = false;
      this.checkResult.message = `Can't find user by user id ${hostUserId}`;
      return;
    }

    const {email} = staff;

    // fake staffId
    // const email = 'andrews@solidcore.co';

    const fullName = _.get(staff, 'profile.fullName');
    const firstName = _.get(staff, 'profile.firstName');
    const lastName = _.get(staff, 'profile.lastName');

    // match mbo api staff
    let StaffId = undefined;
    let mb_staff = undefined;
    for (let page = 1; page <= 3; page++) {
      const mb_staff_params = {
        studioId,
        page,
        pageSize: 1000,
      };
      const mb_staff_resp =
        await this.mindbodyService.getStaff(mb_staff_params);
      const StaffMembers = _.get(mb_staff_resp, 'data.StaffMembers');

      if (StaffMembers) {
        const _mb_staff = _.find(StaffMembers, s => {
          const {DisplayName, LastName, FirstName} = s;

          let success = false;

          if (DisplayName === fullName) {
            success = true;
          }

          if (LastName === lastName && FirstName === firstName) {
            success = true;
          }

          return success;
        });
        if (_mb_staff) {
          mb_staff = _mb_staff;
          break;
        }
      }
    }

    if (mb_staff) {
      StaffId = _.get(mb_staff, 'Id');
    }

    // match snowflake api staff
    if (!StaffId) {
      const staff_params = {
        studioId,
        locationId: LocationId,
        email,
      };
      const sf_staff_resp =
        await this.rawDataCoachService.queryStaff(staff_params);
      const sf_staff = _.get(sf_staff_resp, 'data[0]');
      if (sf_staff) {
        StaffId = _.get(sf_staff, 'TRAINERID');
      }
    }

    if (!StaffId) {
      this.checkResult.success = false;
      this.checkResult.message = `Can't find user ${fullName} ${email} at location ${studioId}`;
      return;
    }

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

    // EndDate = moment(EndDate).add(1, 'years').toISOString();
    // console.log('EndDate', EndDate);

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
