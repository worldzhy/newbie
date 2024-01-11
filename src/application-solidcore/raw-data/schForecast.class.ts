import * as moment from 'moment';
import * as _ from 'lodash';
import {RawDataSchedulingService} from './raw-data-scheduling.service';
import {AiType} from 'src/application-solidcore/schedule/schedule.enum';
import {
  getFirstFullWeekStartDate,
  forecastClass,
} from 'src/application-solidcore/raw-data/raw-data.util';

export class SchForecast {
  rawDataSchedulingService: RawDataSchedulingService;

  studioId: any;
  locationId: any;
  templateMonth: any;
  targetMonth: any;
  checkUtil: any;
  checkUtilOn: any;
  checkRate: any;

  tender: any;

  result: any;

  setClassService(rawDataSchedulingService: RawDataSchedulingService) {
    this.rawDataSchedulingService = rawDataSchedulingService;
  }
  setParams(params: any) {
    const {
      studioId,
      locationId,
      templateMonth,
      targetMonth,
      checkUtil,
      checkUtilOn,
      checkRate,
    } = params;

    this.studioId = studioId;
    this.locationId = locationId;
    this.templateMonth = templateMonth;
    this.targetMonth = targetMonth;
    this.checkUtil = checkUtil;
    this.checkUtilOn = checkUtilOn;
    this.checkRate = checkRate;
  }
  async forecastSteam() {
    const params = {
      studioId: this.studioId,
      locationId: this.locationId,
      dateMonth: this.templateMonth,
    };

    this.tender = await this.rawDataSchedulingService.queryClassTender(params);

    const _monthObj = moment(this.targetMonth, 'YYYY-MM');
    const endDay = _monthObj.endOf('month').daysInMonth();

    const queryDate = moment().subtract(1, 'months');

    let data = await this.rawDataSchedulingService.getForecastData(params);

    console.log(data[0]);
    data = data.map((d: any) => {
      d.weekday = moment(d.CLASSDATE).weekday();
      d.startHour = moment(d.CLASSSTARTTIME, 'HH:mm:ss').hour();
      d.aiInfo = {
        type: AiType.KEEP,
        util: _.round((100 * d.TOTAL_VISITS) / d.MAXCAPACITY),
      };
      return d;
    });

    const groupData = _.groupBy(data, (d: any) => {
      return d.CLASSDATE;
    });

    const weekDays: any = [];
    const firstWeekStart = getFirstFullWeekStartDate(
      queryDate.year(),
      queryDate.month() + 1
    );

    for (let i = 0; i < 7; i++) {
      const _date = moment(firstWeekStart).add(i, 'days').format('YYYY-MM-DD');
      weekDays.push(_date);
    }

    const weekSch: any = [];
    for (const key of Object.keys(groupData)) {
      if (weekDays.indexOf(key) > -1) {
        weekSch.push(...groupData[key]);
      }
    }

    let gWeekSch = _.groupBy(weekSch, (d: any) => {
      return d.weekday;
    });
    gWeekSch = forecastClass(gWeekSch, this.tender);

    const forecastSch: any[] = [];
    let classes: any[] = [];
    for (let i = 1; i <= endDay; i++) {
      const _date = moment(this.targetMonth, 'YYYY-MM').set('date', i);
      const _week = _date.weekday();

      const dayData = _.cloneDeep(gWeekSch[_week]).map((d: any) => {
        d.CLASSDATE = _date.format('YYYY-MM-DD');
        return d;
      });

      forecastSch.push(dayData);
      classes = _.concat(classes, dayData);
    }

    this.result = {
      schedule: forecastSch,
      tender: this.tender,
      classes: classes,
    };
  }
}
