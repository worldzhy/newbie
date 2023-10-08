import {Controller, Get, Query} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiQuery} from '@nestjs/swagger';
import {EventVenueService} from '@microservices/event-scheduling/event-venue.service';
import {PlaceService} from '@microservices/map/place.service';
import {SnowflakeService} from '@toolkit/snowflake/snowflake.service';
import moment from 'moment';

@ApiTags('Snowflake')
@ApiBearerAuth()
@Controller('snowflake')
export class SnowflakeController {
  constructor(
    private readonly snowflakeService: SnowflakeService,
    private readonly eventVenueService: EventVenueService,
    private readonly placeService: PlaceService
  ) {}

  @Get('sync-locations')
  async getLocations() {
    const sqlText = `
    select
      s.studioid,
      l.locationid,
      l.address,
      l.city,
      l.country,
      studioname,
      studioshort,
      wstype,
      swtype,
      s.stateprovcode,
      locationname,
      active,
      invactive,
      l.softdeleted,
      TO_DATE(min(v.classdate)) as firstclassdate
    from
      studios as s
      left join location as l on l.studioid = s.studioid
      and s.stateprovcode = l.stateprovcode
      left join visit_data as v on v.studioid = s.studioid and v.location = l.locationid
    where active = true
    and v.trainerid > 0 
    and v.visittype > 0
    group by 
      s.studioid,
      l.locationid,
      l.address,
      l.city,
      l.country,
      studioname,
      studioshort,
      wstype,
      swtype,
      s.stateprovcode,
      locationname,
      active,
      invactive,
      l.softdeleted
    order by
      s.stateprovcode,
      s.studioid,
      locationname;
    `;

    const options = {
      sqlText,
    };

    const locations: any = await this.snowflakeService.execute(options);
    for (let i = 0; i < locations.length; i++) {
      const location = locations[i];

      const count = await this.eventVenueService.count({
        where: {
          external_studioId: location.STUDIOID,
          external_locationId: location.LOCATIONID,
        },
      });

      if (count === 0) {
        const place = await this.placeService.create({
          data: {
            address: location.ADDRESS,
            city: location.CITY,
            state: location.STATEPROVCODE,
            country: location.COUNTRY,
          },
        });
        await this.eventVenueService.create({
          data: {
            name: location.LOCATIONNAME,
            placeId: place.id,
            external_studioId: location.STUDIOID,
            external_studioName: location.STUDIONAME,
            external_locationId: location.LOCATIONID,
          },
        });
      }
    }
  }

  @Get('scheduling')
  @ApiQuery({name: 'studioId', type: 'number'})
  @ApiQuery({name: 'locationId', type: 'number'})
  @ApiQuery({name: 'datemonth', type: 'number'})
  @ApiQuery({name: 'week', type: 'number'})
  @ApiQuery({name: 'dateStart', type: 'string | undefined'})
  @ApiQuery({name: 'dateEnd', type: 'string | undefined'})
  async getScheduling(
    @Query('studioId') studioId: number,
    @Query('locationId') locationId: number,
    @Query('datemonth') datemonth: number,
    @Query('week') week: number,
    @Query('dateStart') dateStart?: string,
    @Query('dateEnd') dateEnd?: string
  ) {
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
    const options = {
      sqlText,
      binds,
    };

    const data: any = await this.snowflakeService.execute(options);

    return {
      data,
      sqlText,
      sqlParams: binds,
      count: data.length,
    };
  }

  /* End */
}
