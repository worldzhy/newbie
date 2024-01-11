import {Injectable} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {SnowflakeService} from '@toolkit/snowflake/snowflake.service';
import * as _ from 'lodash';

@Injectable()
export class DataGenerationService {
  constructor(
    private readonly snowflakeService: SnowflakeService,
    private readonly prisma: PrismaService
  ) {}

  async genClassDailyVisitData(params): Promise<any> {
    const {studioId, locationId} = params;
    const sqlText = `
    select
      css.studioid as "studioId",
      cs.locationid as "locationId",
      cd.classname as "className",
      css.classid as "classId",
      css.trainerid as "trainerId",
      TO_DATE (css.classdate) as "classDate",
      EXTRACT(HOUR FROM css.starttime) as "startHour",
      cs.maxcapacity as "maxCapacity",
      count(v.clientid) as "totalVisit"
    from
      tblclasssch as css
      left join mb.tblclasses as cs on cs.studioid = css.studioid
      and cs.classid = css.classid
      left join mb.tblclassdescriptions as cd on cs.studioid = cd.studioid
      and cs.descriptionid = cd.classdescriptionid
      left join visit_data as v on v.classid = css.classid
      and v.studioid = css.studioid
      and v.location = cs.locationid
      and v.classdate = css.classdate
    where
      css.trainerid > 0
      and css.studioid = ?
      and css.classdate = '2023-09-06'
      and cs.locationid = ?
    group by
      css.studioid,
      cs.locationid,
      cd.classname,
      css.classid,
      css.trainerid,
      css.classdate,
      css.starttime,
      css.endtime,
      cs.maxcapacity
    order by
      "classDate" asc,
      "startHour" asc
      `;

    const resp = await this.snowflakeService.execute({
      sqlText,
      binds: [studioId, locationId],
    });
    return resp;
  }

  async genClassTrainingSet(params) {
    // const {studioId, locationId} = params;

    const classData = await this.genClassDailyVisitData(params);

    if (!classData || classData.length === 0) {
      return false;
    }
    _.map(classData, (d: any) => {
      d.util = _.round((100 * d.totalVisit) / d.maxCapacity);
      d.className = _.trim(d.className);
    });

    return {
      total: classData.length,
      classData,
    };
  }
}
