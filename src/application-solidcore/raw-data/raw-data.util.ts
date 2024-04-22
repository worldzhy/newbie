import * as moment from 'moment';
import * as _ from 'lodash';
import {AiType} from 'src/application-solidcore/schedule/schedule.enum';

export function getFirstFullWeekStartDate(year, month) {
  const firstDayOfMonth = moment(`${year}-${month}`, 'YYYY-MM').startOf(
    'month'
  );

  const dayOfWeek = firstDayOfMonth.weekday();

  const daysToOffset = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  const firstFullWeekStartDate = moment(`${year}-${month}`, 'YYYY-MM').set(
    'date',
    daysToOffset + 1
  );

  const _startDate = moment(firstFullWeekStartDate).format('YYYY-MM-DD');

  return _startDate;
}

export function frequencyAnalyze(data: any) {
  let _data = data.map((d: any) => {
    d.weekday = moment(d.CLASSDATE).weekday();
    d.startHour = moment(d.CLASSSTARTTIME, 'HH:mm:ss').hour();
    return d;
  });

  _data = _data.filter((d: any) => {
    return !isNaN(d.startHour);
  });

  const wdData = _.groupBy(_data, (d: any) => {
    return d.weekday;
  });

  const hData = _.groupBy(_data, (d: any) => {
    return d.startHour;
  });

  const hours = Object.keys(hData);

  const data2: any[] = [];
  for (const wd of Object.keys(wdData)) {
    const hourData = _.groupBy(wdData[wd], (d: any) => {
      return d.startHour;
    });

    for (const h of hours) {
      // for (const h of Object.keys(hourData)) {
      const css = hourData[h];
      let frequency = 0;
      let utilizationAvg = 0;
      let classname = 'Full Body';
      let classstarttime = undefined;
      let classendtime = undefined;
      let MAXCAPACITY = undefined;

      if (css) {
        const total_max = _.sumBy(css, (d: any) => d.MAXCAPACITY);
        const tatal_vis = _.sumBy(css, (d: any) => d.TOTAL_VISITS);
        frequency = css ? css.length : 0;
        utilizationAvg = _.round(100 * (tatal_vis / total_max));
        classname = css[0].CLASSNAME;
        classstarttime = css[0].CLASSSTARTTIME;
        classendtime = css[0].CLASSENDTIME;
        MAXCAPACITY = css[0].MAXCAPACITY;
      } else {
        const sm_css = _.find(_data, (d: any) => {
          return d.startHour === parseInt(h);
        });
        classname = sm_css.CLASSNAME;
        classstarttime = sm_css.CLASSSTARTTIME;
        classendtime = sm_css.CLASSENDTIME;
        MAXCAPACITY = sm_css.MAXCAPACITY;
      }

      const d2 = {
        weekday: parseInt(wd),
        startHour: parseInt(h),
        frequency,
        utilizationAvg,
        CLASSNAME: classname,
        CLASSSTARTTIME: classstarttime,
        CLASSENDTIME: classendtime,
        MAXCAPACITY,
      };
      data2.push(d2);
    }
  }

  return data2;
}

export function untiAnalyze(_data: any) {
  _data.map((d: any) => {
    d.weekday = moment(d.CLASSDATE).weekday();
    d.week = moment(d.CLASSDATE).week();
    d.month = moment(d.CLASSDATE).month();
    return d;
  });

  const filterData = _.filter(_data, (d: any) => {
    return moment(d.CLASSDATE) < moment().startOf('week');
  });

  const weekedData = _.groupBy(filterData, (d: any) => {
    return d.week;
  });

  const weekDayGroupedData = _.groupBy(filterData, (d: any) => {
    return d.weekday;
  });

  const weekCountData = _.map(weekedData, (d: any, i) => {
    return {
      week: parseInt(i),
      cnt: _.sumBy(d, (ditem: any) => {
        return ditem.TOTAL_VISITS;
      }),
    };
  });

  const weekCountDataValues = weekCountData.map((d: any) => {
    return d.cnt;
  });

  const totalWeekAverage = _.round(_.mean(weekCountDataValues));

  const weekCountDataReverse = _.reverse(weekCountDataValues);

  const data: any[] = [];

  const data0 = {
    weekday: 'Whole Week',
    avg: totalWeekAverage,
    week1: weekCountDataReverse[0],
    week2: weekCountDataReverse[1],
    week3: weekCountDataReverse[2],
    week4: weekCountDataReverse[3],
    month1: _.round(_.mean(_.slice(weekCountDataReverse, 0, 3))),
    month2: _.round(_.mean(_.slice(weekCountDataReverse, 4, 7))),
    month3: _.round(_.mean(_.slice(weekCountDataReverse, 8, 11))),
  };
  data.push(data0);

  // eslint-disable-next-line guard-for-in
  for (const wd in weekDayGroupedData) {
    const weedDayData = weekDayGroupedData[wd];

    const _weekedData = _.groupBy(weedDayData, (d: any) => {
      return d.week;
    });

    const _monthedData = _.groupBy(weedDayData, (d: any) => {
      return d.month;
    });

    const _weekCountData = _.map(_weekedData, (d: any, i) => {
      return {
        week: i,
        cnt: _.sumBy(d, (ditem: any) => {
          return ditem.TOTAL_VISITS;
        }),
      };
    });

    const _weekUtilData = _.map(_weekedData, (d: any, i) => {
      const visit_cnt = _.sumBy(d, (ditem: any) => {
        return ditem.TOTAL_VISITS;
      });
      const max_cnt = _.sumBy(d, (ditem: any) => {
        return ditem.MAXCAPACITY;
      });

      return {
        week: i,
        // month: moment(d[0].CLASSDATE).month(),
        avgUtil: _.round((100 * visit_cnt) / max_cnt, 0),
      };
    });

    const _monthUtilData = _.map(_monthedData, (d: any, i) => {
      const visit_cnt = _.sumBy(d, (ditem: any) => {
        return ditem.TOTAL_VISITS;
      });
      const max_cnt = _.sumBy(d, (ditem: any) => {
        return ditem.MAXCAPACITY;
      });

      return {
        month: i,
        avgUtil: _.round((100 * visit_cnt) / max_cnt, 0),
      };
    });

    const _weekCountDataValues = _weekCountData.map((d: any) => {
      return d.cnt;
    });
    const _weekUtilDataValues = _weekUtilData.map((d: any) => {
      return d.avgUtil;
    });

    const _monthUtilDataValues = _monthUtilData.map((d: any) => {
      return d.avgUtil;
    });

    const _totalWeekUtilAverage = _.round(_.mean(_weekUtilDataValues));
    const _totalMonthUtilAverage = _.round(_.mean(_monthUtilDataValues));

    const _totalWeekAverage = _.round(_.mean(_weekCountDataValues));

    const _weekCountDataReverse = _.reverse(_weekCountDataValues);

    const _weekUtilDataReverse = _.reverse(_weekUtilDataValues);

    const obj = {
      weekday: [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ][wd],
      weekdayNo: parseInt(wd),
      avg: _totalWeekAverage,
      AvgUtilWeek: _totalWeekUtilAverage,
      AvgUtilMonth: _totalMonthUtilAverage,
      week1: _weekCountDataReverse[0],
      week2: _weekCountDataReverse[1],
      week3: _weekCountDataReverse[2],
      week4: _weekCountDataReverse[3],
      week1Util: _weekUtilDataReverse[0],
      week2Util: _weekUtilDataReverse[1],
      week3Util: _weekUtilDataReverse[2],
      week4Util: _weekUtilDataReverse[3],
      month1: _.round(_.mean(_.slice(_weekCountDataReverse, 0, 3))),
      month2: _.round(_.mean(_.slice(_weekCountDataReverse, 4, 7))),
      month3: _.round(_.mean(_.slice(_weekCountDataReverse, 8, 11))),
    };
    data.push(obj);
  }

  const r_fds = ['week1', 'week2', 'week3', 'week4'];
  const checkRate = 5;
  for (const d of data) {
    const rateArr: any[] = [];
    let weekRateCnt = 0;

    // for (const f of fds) {
    //   d[`${f}_rate`] = _.round((100 * (d[f] - d['avg'])) / d['avg']);
    // }
    for (const rf of r_fds) {
      rateArr.push(_.round((100 * (d[rf] - d['avg'])) / d['avg']));
    }

    for (const rate of rateArr) {
      if (rate > checkRate) {
        weekRateCnt++;
      }

      if (rate < -checkRate) {
        weekRateCnt--;
      }
    }
    d.weekRateCnt = weekRateCnt;
  }

  return data;
}

export function getAvgUtil(data: any) {
  const MAXCAPACITY_ALL = _.sumBy(data, (d: any) => {
    return d.MAXCAPACITY;
  });

  const TOTAL_VISITS_ALL = _.sumBy(data, (d: any) => {
    return d.TOTAL_VISITS;
  });

  const avgUtil = _.round((100 * TOTAL_VISITS_ALL) / MAXCAPACITY_ALL);
  return avgUtil;
}

export function getAvgVisit(data: any) {
  const avgUtil = _.mean(
    data.map((d: any) => {
      return d.TOTAL_VISITS;
    })
  );
  return avgUtil;
}

export function getHourUtil(data: any) {
  const weekdayGbData = _.groupBy(data, (d: any) => d.weekday);

  const hourUtil: any[] = [];
  for (const wd of Object.keys(weekdayGbData)) {
    const hourGbData = _.groupBy(weekdayGbData[wd], (d: any) => d.startHour);
    for (const h of Object.keys(hourGbData)) {
      const avgUtil = getAvgUtil(hourGbData[h]);
      hourUtil.push({wd: parseInt(wd), h: parseInt(h), util: avgUtil});
    }
  }
  return hourUtil;
}

export function addClass(classNo, sch, frequency) {
  let cloneSch = _.cloneDeep(sch);
  const startHour1 = cloneSch.map((d: any) => {
    return parseInt(d.startHour);
  });

  const hourCanUse = _.filter(frequency, (d: any) => {
    return startHour1.indexOf(parseInt(d.startHour)) === -1;
  });

  if (hourCanUse.length > 0) {
    const srortedhourCanUse = _.orderBy(hourCanUse, (d: any) => d.frequency, [
      'desc',
    ]);
    const addedClass = _.take(srortedhourCanUse, classNo);
    addedClass.map((d: any) => {
      d.aiInfo.type = AiType.ADD;
      return d;
    });
    cloneSch = _.concat(cloneSch, addedClass);
    cloneSch = _.sortBy(cloneSch, (d: any) => d.startHour);
  }

  return cloneSch;
}
export function removeClass(classNo, sch, frequency) {
  const cloneSch = _.cloneDeep(sch);
  const startHour1 = cloneSch.map((d: any) => {
    return parseInt(d.startHour);
  });

  const hourCanUse = _.filter(frequency, (d: any) => {
    return startHour1.indexOf(parseInt(d.startHour)) > -1;
  });

  if (hourCanUse.length > 0) {
    const srortedhourCanUse = _.orderBy(hourCanUse, (d: any) => d.frequency, [
      'asc',
    ]);

    const removeClass = _.take(srortedhourCanUse, -classNo);
    const removeClassStartHours = removeClass.map((d: any) =>
      parseInt(d.startHour)
    );

    cloneSch.forEach((d: any) => {
      if (removeClassStartHours.indexOf(parseInt(d.startHour)) > -1) {
        d.aiInfo.type = AiType.REMOVE;
      }
    });
  }

  return cloneSch;
}

export function forecastClass(gWeekSch, tender) {
  const {utliAvg, frequency, hourUtil} = tender;

  const frequencyByWd = _.groupBy(frequency, (d: any) => {
    return d.weekday;
  });

  for (const _week of Object.keys(gWeekSch)) {
    const weekdayTender = _.find(utliAvg, (d: any) => {
      return d.weekdayNo === parseInt(_week);
    });

    const {avgUtil, weekRateCnt} = weekdayTender;

    let classChange = 0;

    const checkUtil = 60;
    const checkUtilOn = false;

    // if (avgUtil > checkUtil) {
    //   if (weekRateCnt <= -2) {
    //     classChange--;
    //   }
    // }

    switch (weekRateCnt) {
      case 3:
        if (!checkUtilOn || avgUtil < checkUtil) {
          classChange++;
        }
        break;
      case 4:
        if (!checkUtilOn || avgUtil < checkUtil) {
          classChange += 2;
        }
        break;

      case -3:
        classChange--;
        break;
      case -4:
        classChange -= 2;
        break;
      default:
        break;
    }

    // classChange = -1;
    if (classChange > 0) {
      gWeekSch[_week] = addClass(
        classChange,
        gWeekSch[_week],
        frequencyByWd[_week]
      );
    }

    if (classChange < 0) {
      gWeekSch[_week] = removeClass(
        classChange,
        gWeekSch[_week],
        frequencyByWd[_week]
      );
    }

    for (const _class of gWeekSch[_week]) {
      const utilObj = _.find(hourUtil, (d: any) => {
        return d.h === _class.startHour && d.wd === _class.weekday;
      });

      if (utilObj) {
        _class.util = utilObj.util;
      } else {
        _class.util = 0;
      }
    }
  }

  return gWeekSch;
}

export function getFullYearsBetweenDates(_startDate, _endDate) {
  const startDate = new Date(_startDate);
  const endDate = new Date(_endDate);
  const fullYears: any[] = [];
  let currentYear = startDate.getFullYear() + 1;
  // let currentYear = startDate.getFullYear();

  while (currentYear <= endDate.getFullYear() - 1) {
    // while (currentYear <= endDate.getFullYear()) {
    fullYears.push(currentYear);
    currentYear++;
  }

  return fullYears;
}

export function getMonthWeeks(yearMonth) {
  const startDate = moment(yearMonth, 'YYYY-MM');

  // 获取该月的天数
  const daysInMonth = startDate.daysInMonth();

  // 创建一个 Moment.js 对象，表示指定年份和月份的最后一天
  const endDate = moment(startDate).add(daysInMonth - 1, 'days');

  // 创建一个 Moment.js 对象，表示该月的第一天
  let currentWeekStart = moment(startDate).startOf('week');

  // 存储周的列表
  const weeks: any[] = [];

  // 循环生成周的范围
  while (currentWeekStart.isBefore(endDate)) {
    const weekEnd = moment(currentWeekStart).endOf('week');
    weeks.push({
      start: currentWeekStart.format('YYYY-MM-DD'),
      end: weekEnd.format('YYYY-MM-DD'),
      weekNumber: weekEnd.week(),
    });

    currentWeekStart = weekEnd.add(1, 'day');
  }
  return weeks.map((d: any) => d.weekNumber);
}

export function zeroPadHour(hour) {
  // Use padStart to add a leading zero if the hour is a single digit
  return String(hour).padStart(2, '0');
}
