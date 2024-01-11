/* eslint-disable @typescript-eslint/no-explicit-any */
import {Injectable} from '@nestjs/common';
import {SnowflakeService} from '@toolkit/snowflake/snowflake.service';
import * as moment from 'moment';
import {
  getTimeZoneOffset,
  splitDateTime,
} from '@toolkit/utilities/datetime.util';
import {SchForecast} from './schForecast.class';
import {
  frequencyAnalyze,
  untiAnalyze,
  getHourUtil,
} from 'src/application-solidcore/raw-data/raw-data.util';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class RawDataSchedulingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly snowflakeService: SnowflakeService
  ) {}

  async synchronize(params: {venueId: number; year: number; month: number}) {
    const {venueId, year, month} = params;

    // [step 1] Get event venue.
    const venue = await this.prisma.eventVenue.findUniqueOrThrow({
      where: {id: venueId},
    });
    const timeZone = (
      await this.prisma.place.findUniqueOrThrow({
        where: {id: venue.placeId!},
        select: {timeZone: true},
      })
    ).timeZone;

    // [step 2] Fetch visit data.
    const dateOfStart = new Date(year, month - 1, 1);
    const dateOfEnd = new Date(year, month, 0);
    const sqlText = `
    select
      v.studioid,
      trim(cd.classname) as classname,
      v.classid,
      TO_DATE(v.classdate) as classdate,
      TO_TIME(c.classstarttime) as classstarttime,
      TO_TIME(c.classendtime) as classendtime,
      lower(t.tremailname) as tremailname
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
      classname,
      tremailname,
      v.classid,
      v.classdate,
      classstarttime,
      classendtime
    order by
      v.studioid asc,
      classdate asc,
      v.classid;
    `;
    const binds = [
      venue.external_studioId,
      venue.external_locationId,
      dateOfStart,
      dateOfEnd,
    ];
    const options = {
      sqlText,
      binds,
    };

    const visits: any = await this.snowflakeService.execute(options);
    const eventTypes = await this.prisma.eventType.findMany({});

    if (visits.length <= 0) {
      return [];
    }

    return (
      await Promise.all(
        visits.map(
          async (visit: {
            CLASSNAME: string;
            CLASSDATE: string;
            CLASSSTARTTIME: string;
            CLASSENDTIME: string;
            TREMAILNAME: string;
          }) => {
            const dateOfClass = new Date(visit.CLASSDATE)
              .toISOString()
              .split('T')[0];
            const timeZoneOffset = getTimeZoneOffset(
              new Date(dateOfClass),
              timeZone ?? undefined
            );
            const datetimeOfStart = new Date(
              dateOfClass + ' ' + visit.CLASSSTARTTIME + timeZoneOffset
            );
            const datetimeOfEnd = new Date(
              dateOfClass + ' ' + visit.CLASSENDTIME + timeZoneOffset
            );

            // Get coach info
            if (!visit.TREMAILNAME) {
              return;
            }
            if (visit.TREMAILNAME.endsWith('.')) {
              visit.TREMAILNAME = visit.TREMAILNAME.slice(0, -1);
            }
            const coach = await this.prisma.user.findUnique({
              where: {email: visit.TREMAILNAME},
              select: {id: true},
            });

            // Get class info
            let eventType;
            visit.CLASSNAME = visit.CLASSNAME.replace('  ', ' ').trim();
            if (visit.CLASSNAME.includes('+')) {
              const splittedName = visit.CLASSNAME.split('+');
              visit.CLASSNAME =
                splittedName[0].trim() + ' + ' + splittedName[1].trim();
            }
            for (let i = 0; i < eventTypes.length; i++) {
              eventTypes[i].aliases
                .concat(eventTypes[i].name)
                .forEach(alias => {
                  if (
                    visit.CLASSNAME.toLowerCase().includes(
                      alias.toLowerCase()
                    ) ||
                    alias.toLowerCase().includes(visit.CLASSNAME.toLowerCase())
                  ) {
                    eventType = eventTypes[i];
                  }
                });
            }
            if (!eventType) {
              eventType = await this.prisma.eventType.create({
                data: {name: visit.CLASSNAME, minutesOfDuration: 0},
              });
            }

            const splitedDateTime = splitDateTime(
              datetimeOfStart,
              timeZone ?? undefined
            );
            return {
              hostUserId: coach ? coach.id : null,
              datetimeOfStart: datetimeOfStart.toISOString(),
              datetimeOfEnd: datetimeOfEnd.toISOString(),
              year: splitedDateTime.year,
              month: splitedDateTime.month,
              dayOfMonth: splitedDateTime.dayOfMonth,
              dayOfWeek: splitedDateTime.dayOfWeek,
              hour: splitedDateTime.hour,
              minute: splitedDateTime.minute,
              timeZone,
              minutesOfDuration: Number(
                (datetimeOfEnd.getTime() - datetimeOfStart.getTime()) / 60000
              ),
              typeId: eventType.id,
              venueId,
            };
          }
        )
      )
    ).filter(element => {
      return element !== null && element !== undefined;
    });
  }

  async aiPrediction(params: {venueId: number}) {
    const {venueId} = params;

    // [step 1] Get event venue.
    const venue = await this.prisma.eventVenue.findUniqueOrThrow({
      where: {id: venueId},
    });
    const timeZone = (
      await this.prisma.place.findUniqueOrThrow({
        where: {id: venue.placeId!},
        select: {timeZone: true},
      })
    ).timeZone;

    const templateMonth = moment().subtract(1, 'months').format('YYYY-MM');
    const targetMonth = templateMonth;

    const tenderClassParams = {
      studioId: venue.external_studioId,
      locationId: venue.external_locationId,
      templateMonth,
      targetMonth,
      checkUtil: 60,
      checkUtilOn: false,
      checkRate: 5,
    };

    const schForecast = new SchForecast();
    schForecast.setClassService(this);
    schForecast.setParams(tenderClassParams);
    await schForecast.forecastSteam();
    const visits = schForecast.result.classes;

    const eventTypes = await this.prisma.eventType.findMany({});

    if (visits.length <= 0) {
      return [];
    }

    return (
      await Promise.all(
        visits.map(
          async (visit: {
            CLASSNAME: string;
            CLASSDATE: string;
            CLASSSTARTTIME: string;
            CLASSENDTIME: string;
            TREMAILNAME: string;
            aiInfo: any;
          }) => {
            const dateOfClass = new Date(visit.CLASSDATE)
              .toISOString()
              .split('T')[0];
            const timeZoneOffset = getTimeZoneOffset(
              new Date(dateOfClass),
              timeZone ?? undefined
            );
            const datetimeOfStart = new Date(
              dateOfClass + ' ' + visit.CLASSSTARTTIME + timeZoneOffset
            );
            const datetimeOfEnd = new Date(
              dateOfClass + ' ' + visit.CLASSENDTIME + timeZoneOffset
            );

            // Get coach info
            if (!visit.TREMAILNAME) {
              return;
            }
            if (visit.TREMAILNAME.endsWith('.')) {
              visit.TREMAILNAME = visit.TREMAILNAME.slice(0, -1);
            }
            const coach = await this.prisma.user.findUnique({
              where: {email: visit.TREMAILNAME},
              select: {id: true},
            });

            // Get class info
            let eventType;
            visit.CLASSNAME = visit.CLASSNAME.replace('  ', ' ').trim();
            if (visit.CLASSNAME.includes('+')) {
              const splittedName = visit.CLASSNAME.split('+');
              visit.CLASSNAME =
                splittedName[0].trim() + ' + ' + splittedName[1].trim();
            }
            for (let i = 0; i < eventTypes.length; i++) {
              eventTypes[i].aliases
                .concat(eventTypes[i].name)
                .forEach(alias => {
                  if (
                    visit.CLASSNAME.toLowerCase().includes(
                      alias.toLowerCase()
                    ) ||
                    alias.toLowerCase().includes(visit.CLASSNAME.toLowerCase())
                  ) {
                    eventType = eventTypes[i];
                  }
                });
            }
            if (!eventType) {
              eventType = await this.prisma.eventType.create({
                data: {name: visit.CLASSNAME, minutesOfDuration: 0},
              });
            }

            const splitedDateTime = splitDateTime(
              datetimeOfStart,
              timeZone ?? undefined
            );
            return {
              hostUserId: coach ? coach.id : null,
              datetimeOfStart: datetimeOfStart.toISOString(),
              datetimeOfEnd: datetimeOfEnd.toISOString(),
              year: splitedDateTime.year,
              month: splitedDateTime.month,
              dayOfMonth: splitedDateTime.dayOfMonth,
              dayOfWeek: splitedDateTime.dayOfWeek,
              hour: splitedDateTime.hour,
              minute: splitedDateTime.minute,
              timeZone,
              minutesOfDuration: Number(
                (datetimeOfEnd.getTime() - datetimeOfStart.getTime()) / 60000
              ),
              typeId: eventType.id,
              venueId,
              aiInfo: visit.aiInfo,
            };
          }
        )
      )
    ).filter(element => {
      return element !== null && element !== undefined;
    });
  }

  async queryClassUtil(params) {
    const {studioId, locationId, datemonth} = params;

    let {dateStart, dateEnd} = params;

    if (datemonth) {
      dateStart = moment(datemonth, 'YYYY-MM')
        .startOf('month')
        .format('YYYY-MM-DD');

      dateEnd = moment(datemonth, 'YYYY-MM')
        .endOf('month')
        .format('YYYY-MM-DD');
    }

    const sqlText = `
      select
        v.studioid,
        cd.classname,
        v.classid,
        TO_CHAR(v.classdate, 'YYYY-MM-DD') as classdate,
        TO_TIME(c.classstarttime) as classstarttime,
        TO_TIME(c.classendtime) as classendtime,
        concat(t.trfirstname, ' ', t.trlastname) as trainername,
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
        trainername
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

    const data: any = await this.snowflakeService.execute(executeOpt);

    return {
      data,
      count: data.length,
      sqlText,
      sqlParams: binds,
    };
  }

  async queryClassTender(params) {
    const dateStart = moment().startOf('month').subtract(3, 'months').format();
    const dateEnd = moment().endOf('month').subtract(1, 'months').format();

    const {data} = await this.queryClassUtil({
      studioId: params.studioId,
      locationId: params.locationId,
      dateStart,
      dateEnd,
    });

    const frequency = frequencyAnalyze(data);
    const utliAvg = untiAnalyze(data);
    const hourUtil = getHourUtil(data);

    return {
      frequency,
      utliAvg,
      hourUtil,
    };
  }

  async getForecastData(params) {
    const {studioId, locationId} = params;

    const queryDate = moment().subtract(1, 'months');
    const dateStart = queryDate.startOf('month').format();
    const dateEnd = queryDate.endOf('month').format();
    const sqlText = `
    select
      css.studioid,
      cd.classname,
      c.classid,
      TO_CHAR(css.classdate, 'YYYY-MM-DD') as classdate,
      TO_TIME(c.classstarttime) as classstarttime,
      TO_TIME(c.classendtime) as classendtime,
      lower(t.tremailname) as tremailname,
      c.maxcapacity,
      count(1) as total_visits
    from
      tblclasssch as css
      left join mb.tblclasses as c on c.studioid = css.studioid
      and c.classid = css.classid
      left join mb.tblclassdescriptions as cd on c.studioid = cd.studioid
      and c.descriptionid = cd.classdescriptionid
      left join mb.visit_data as v on css.studioid = v.studioid
      and c.classid = v.classid and v.location = c.locationid and css.classdate = v.classdate
      left join mb.trainers as t on v.studioid = t.studioid
      and v.trainerid = t.trainerid
    where
      css.trainerid > 0
      and css.studioid = ?
      and c.locationid = ?
      and css.classdate >= ?
      and css.classdate <= ?
    group by
      css.studioid,
      cd.classname,
      c.classid,
      TO_CHAR(css.classdate, 'YYYY-MM-DD'),
      TO_TIME(c.classstarttime),
      TO_TIME(c.classendtime),
      c.maxcapacity,
      tremailname
    order by
      classdate,
      classstarttime
    `;
    const binds = [studioId, locationId, dateStart, dateEnd];
    const executeOpt = {
      sqlText,
      binds,
    };

    const data: any = await this.snowflakeService.execute(executeOpt);

    return data;
  }
}
