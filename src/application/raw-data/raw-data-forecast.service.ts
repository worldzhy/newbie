import {Injectable} from '@nestjs/common';
import {EventVenueService} from '@microservices/event-scheduling/event-venue.service';
import {SnowflakeService} from '@toolkit/snowflake/snowflake.service';
import * as moment from 'moment';
import * as _ from 'lodash';

const ANALYSE_MONTH = 1;

@Injectable()
export class RawDataForecastService {
  private gWeekSch: _.Dictionary<any[]>;
  private forecastSch: any[];
  private fixRate: any[];

  constructor(
    private readonly snowflakeService: SnowflakeService,
    private readonly eventVenueService: EventVenueService
  ) {}

  async forecast(params: {venueId: number; year: number; month: number}) {
    const location = await this.eventVenueService.findUniqueOrThrow({
      where: {id: params.venueId},
    });
    const studioId = location.external_studioId;
    const locationId = location.external_locationId;

    await this.getLastMonthData({studioId, locationId});
    await this.getForcastSch({year: params.year, month: params.month});
    await this.getFixRate();
    await this.fixByHistory();

    return this.forecastSch;
  }

  private async getLastMonthData(params: {
    studioId: number;
    locationId: number;
  }) {
    const dateStart = moment()
      .subtract(1, 'days')
      .subtract(ANALYSE_MONTH, 'months')
      .format('YYYY-MM-DD');
    const dateEnd = moment().subtract(1, 'days').format('YYYY-MM-DD');

    const data = await this.getClassSch({
      studioId: params.studioId,
      locationId: params.locationId,
      dateStart,
      dateEnd,
    });
    data.map((d: any) => {
      d.weekday = moment(d.CLASSDATE).weekday();
      d.startHour = moment(d.CLASSSTARTTIME, 'HH:mm:ss').hour();
    });

    const weekdayGbData = _.groupBy(data, (d: any) => d.weekday);

    const weekClasses: any[] = [];
    for (const wd of Object.keys(weekdayGbData)) {
      const hourGbData = _.groupBy(weekdayGbData[wd], (d: any) => d.startHour);
      for (const h of Object.keys(hourGbData)) {
        const avgUtil = this.getAvgUtil(hourGbData[h]);
        const avgVisit = this.getAvgVisit(hourGbData[h]);
        const {
          STUDIOID,
          CLASSNAME,
          CLASSID,
          CLASSSTARTTIME,
          CLASSENDTIME,
          MAXCAPACITY,
        } = hourGbData[h][0];

        const _obj = {
          STUDIOID,
          CLASSNAME,
          CLASSID,
          CLASSSTARTTIME,
          CLASSENDTIME,
          MAXCAPACITY,
          weekday: parseInt(wd),
          startHour: parseInt(h),
          util: avgUtil,
          avgVisit,
        };
        weekClasses.push(_obj);
      }
    }
    const gWeekSch = _.groupBy(weekClasses, (d: any) => d.weekday);

    for (const wd of Object.keys(gWeekSch)) {
      gWeekSch[wd] = _.sortBy(gWeekSch[wd], (d: any) => d.startHour);
    }
    this.gWeekSch = gWeekSch;
  }

  private async getForcastSch(params: {year: number; month: number}) {
    const targetMonth = params.year.toString() + '-' + params.month.toString();
    const _monthObj = moment(targetMonth, 'YYYY-MM');
    const endDay = _monthObj.daysInMonth();

    const forecastSch: any[] = [];
    for (let i = 1; i <= endDay; i++) {
      const _date = moment(targetMonth, 'YYYY-MM').set('date', i);
      const _week = _date.weekday();

      if (this.gWeekSch[_week]) {
        const dayData = _.cloneDeep(this.gWeekSch[_week]).map((d: any) => {
          d.CLASSDATE = _date.format('YYYY-MM-DD');
          d.week = _date.week();
          return d;
        });
        forecastSch.push(dayData);
      }
    }

    this.forecastSch = forecastSch;
  }

  private async getFixRate() {
    const studioId = 412105;
    const locationId = 2;

    const dateStart = moment().year(2018).startOf('year').format('YYYY-MM-DD');
    const dateEnd = moment().year(2018).endOf('year').format('YYYY-MM-DD');

    const params = {studioId, locationId, dateStart, dateEnd};
    const data = await this.getClassSch(params);

    data.map((d: any) => {
      d.weekday = moment(d.CLASSDATE).weekday();
      d.startHour = moment(d.CLASSSTARTTIME, 'HH:mm:ss').hour();
      d.year = moment(d.CLASSDATE).year();
      d.month = moment(d.CLASSDATE).month();
      d.week = moment(d.CLASSDATE).week();
      d.date = moment(d.CLASSDATE).format('YYYY-MM-DD');
    });

    const weekGbData = _.groupBy(data, (d: any) => d.week);

    let total_vist = 0;
    let total_avg_util = 0;
    const total_week = Object.keys(weekGbData).length;

    const weekDatas: any[] = [];
    for (const week of Object.keys(weekGbData)) {
      const weekData = weekGbData[week];
      const week_max = _.sumBy(weekData, (d: any) => d.MAXCAPACITY);
      const week_vis = _.sumBy(weekData, (d: any) => d.TOTAL_VISITS);
      const week_avg_util = _.round(100 * (week_vis / week_max));
      const obj = {
        year: weekData[0].year,
        week: weekData[0].week,
        week_vis,
        week_max,
        week_avg_util,
      };

      total_vist += week_vis;
      total_avg_util += week_avg_util;

      weekDatas.push(obj);
    }

    const total_week_avg_vis = _.round(total_vist / total_week);
    const total_week_avg_util = _.round(total_avg_util / total_week);

    for (const weekData of weekDatas) {
      weekData.deviationRate = _.round(
        (100 * (weekData.week_avg_util - total_week_avg_util)) /
          total_week_avg_util
      );
      weekData.deviationVis = weekData.week_vis - total_week_avg_vis;
    }

    this.fixRate = weekDatas;
  }

  private async fixByHistory() {
    for (const dayData of this.forecastSch) {
      for (const classData of dayData) {
        const rateData = _.find(
          this.fixRate,
          (d: any) => d.week === classData.week
        );
        if (rateData) {
          const {deviationRate} = rateData;
          classData.orgUtil = classData.orgUtil;
          classData.util = _.round((1 + deviationRate / 100) * classData.util);
        }
      }
    }
  }

  private async getClassSch(params: {
    studioId?: any;
    locationId?: any;
    dateStart?: any;
    dateEnd?: any;
    datemonth?: any;
    week?: any;
  }): Promise<any[]> {
    const {studioId, locationId, datemonth, week} = params;
    let {dateStart, dateEnd} = params;

    if (datemonth) {
      dateStart = moment(datemonth, 'YYYY-MM').startOf('month').format();
      dateEnd = moment(datemonth, 'YYYY-MM').endOf('month').format();
    }

    if (week) {
      dateStart = moment(datemonth, 'YYYY-MM')
        .startOf('month')
        .add(7 * (week - 1), 'days')
        .format();
      dateEnd = moment(datemonth, 'YYYY-MM')
        .day(1)
        .add(7 * (week - 1), 'days')
        .endOf('week')
        .format();
      if (week === 5) {
        dateEnd = moment(datemonth, 'YYYY-MM').endOf('month').format();
      }
    }

    const sqlText = `
    select
      v.studioid,
      cd.classname,
      v.classid,
      TO_DATE(v.classdate) as classdate,
      TO_TIME(c.classstarttime) as classstarttime,
      TO_TIME(c.classendtime) as classendtime,
      concat(t.trfirstname, ' ', t.trlastname) as trainername,
      t.trainerId,
      c.maxcapacity,
      count(1) as total_visits,
      ROUND(100 * total_visits / maxcapacity) as "Utilization %"
    from
      mb.visit_data as v
      left join mb.studios as s on s.studioid = v.studioid
      left join mb.location as l on v.studioid = l.studioid
      and v.location = l.locationid
      left join mb.trainers as t on v.studioid = t.studioid
      and v.trainerid = t.trainerid
      left join mb.tblclasses as c on c.studioid = v.studioid
      and c.classid = v.classid
      left join mb.tblclassdescriptions as cd on c.studioid = cd.studioid
      and c.descriptionid = cd.classdescriptionid
    where
      v.trainerid > 0
      and v.visittype > 0
      and v.studioid = ?
      and v.location = ?
      and v.classdate >= ?
      and v.classdate <= ?
    group by
      v.studioid,
      cd.classname,
      v.classid,
      v.classdate,
      c.maxcapacity,
      classstarttime,
      classendtime,
      trainername,
      t.trainerId
    order by
      v.studioid asc,
      classdate asc,
      v.classid;
    `;
    const binds = [studioId, locationId, dateStart, dateEnd];
    const executeOpt = {
      sqlText,
      binds,
    };

    return (await this.snowflakeService.execute(executeOpt)) as any[];
  }

  private getAvgUtil(data: any) {
    const MAXCAPACITY_ALL = _.sumBy(data, (d: any) => {
      return d.MAXCAPACITY;
    });

    const TOTAL_VISITS_ALL = _.sumBy(data, (d: any) => {
      return d.TOTAL_VISITS;
    });

    const avgUtil = _.round((100 * TOTAL_VISITS_ALL) / MAXCAPACITY_ALL);
    return avgUtil;
  }

  private getAvgVisit(data: any) {
    const avgUtil = _.mean(
      data.map((d: any) => {
        return d.TOTAL_VISITS;
      })
    );
    return avgUtil;
  }

  /* End */
}
