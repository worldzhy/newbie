import {Controller, Get, Query} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiQuery} from '@nestjs/swagger';
import {UserService} from '@microservices/account/user/user.service';
import {EventContainerService} from '@microservices/event-scheduling/event-container.service';
import {EventVenueService} from '@microservices/event-scheduling/event-venue.service';
import {EventService} from '@microservices/event-scheduling/event.service';
import {PlaceService} from '@microservices/map/place.service';
import {SnowflakeService} from '@toolkit/snowflake/snowflake.service';
import {EventContainerOrigin, EventContainerStatus} from '@prisma/client';

const ROLE_NAME_COACH = 'Coach';

@ApiTags('Snowflake')
@ApiBearerAuth()
@Controller('snowflake')
export class SnowflakeController {
  constructor(
    private readonly snowflakeService: SnowflakeService,
    private readonly eventContainerService: EventContainerService,
    private readonly eventVenueService: EventVenueService,
    private readonly eventService: EventService,
    private readonly placeService: PlaceService,
    private readonly userService: UserService
  ) {}

  @Get('sync-coaches')
  async getCoaches() {
    const sqlText = `
    select distinct lower(tremailname) as tremailname, trfirstname, trlastname 
    from mindbodyorg_mindbody_sldcor_mbo_secure_views.mb.trainers 
    where active=true and deleted=false and trainerid > 100000000 and studioid > 0 and teacher = true and tremailname is not null;;
    `;

    const options = {
      sqlText,
    };

    const coaches: any = await this.snowflakeService.execute(options);
    for (let i = 0; i < coaches.length; i++) {
      const coach = coaches[i];
      console.log(coach);

      if ((coach.TREMAILNAME as string).endsWith('.')) {
        coach.TREMAILNAME = coach.TREMAILNAME.slice(0, -1);
      }

      const count = await this.userService.count({
        where: {email: coach.TREMAILNAME},
      });

      if (count === 0) {
        await this.userService.create({
          data: {
            email: coach.TREMAILNAME,
            roles: {connect: {name: ROLE_NAME_COACH}},
            profile: {
              create: {
                firstName: coach.TRFIRSTNAME,
                lastName: coach.TRLASTNAME,
              },
            },
          },
        });
      }
    }
  }

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

  @Get('sync-visit-data')
  @ApiQuery({name: 'venueId', type: 'number'})
  @ApiQuery({name: 'year', type: 'number'})
  @ApiQuery({name: 'month', type: 'number'})
  async getScheduling(
    @Query('venueId') venueId: number,
    @Query('year') year: number,
    @Query('month') month: number
  ) {
    // [step 1] Get event venue.
    const venue = await this.eventVenueService.findUniqueOrThrow({
      where: {id: venueId},
    });

    // [step 2] Check if the data has been fetched.
    let count = await this.eventContainerService.count({
      where: {
        origin: EventContainerOrigin.EXTERNAL,
        year,
        month,
        venueId,
      },
    });
    if (count > 0) {
      return;
    }

    const eventContainer = await this.eventContainerService.create({
      data: {
        name: `[Snowflake data] ${month}/${year} ${venue.name}`,
        origin: EventContainerOrigin.EXTERNAL,
        status: EventContainerStatus.EDITING,
        year,
        month,
        venueId,
      },
    });

    // [step 3] Fetch visit data.
    const dateOfStart = new Date(year, month - 1, 1);
    const dateOfEnd = new Date(year, month, 0);
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
    /*
    {
      "STUDIOID": 5723396,
      "CLASSNAME": "Beginner50",
      "CLASSID": 2075,
      "CLASSDATE": "2023-05-31",
      "CLASSSTARTTIME": "10:35:00",
      "CLASSENDTIME": "11:25:00",
      "TRAINERNAME": "Akilah Walker",
      "TRAINERID": 100000028,
      "MAXCAPACITY": 15,
      "TOTAL_VISITS": 8,
      "Utilization %": 53
    }
    */

    await this.eventService.createMany({
      data: visits.map(
        (visit: {
          CLASSDATE: string;
          CLASSSTARTTIME: string;
          CLASSENDTIME: string;
          TRAINERID: any;
        }) => {
          const dateOfClass = new Date(visit.CLASSDATE)
            .toISOString()
            .split('T')[0];
          const datetimeOfStart = new Date(
            dateOfClass + 'T' + visit.CLASSSTARTTIME
          );
          const datetimeOfEnd = new Date(
            dateOfClass + 'T' + visit.CLASSENDTIME
          );

          return {
            hostUserId: '0e86a56f-57f7-41e6-83ab-40f2c694a28e',
            datetimeOfStart: datetimeOfStart.toISOString(),
            datetimeOfEnd: datetimeOfEnd.toISOString(),
            year,
            month,
            dayOfMonth: datetimeOfStart.getDate(),
            dayOfWeek: datetimeOfStart.getDay(),
            hour: datetimeOfStart.getHours(),
            minute: datetimeOfStart.getMinutes(),
            minutesOfDuration: Number(
              (datetimeOfEnd.getTime() - datetimeOfStart.getTime()) / 60000
            ),
            typeId: 1,
            venueId,
            containerId: eventContainer.id,
          };
        }
      ),
    });

    // for (let i = 0; i < visits.length; i++) {
    //   const visit = visits[i];

    //   const dateOfClass = new Date(visit.CLASSDATE).toISOString().split('T')[0];
    //   const datetimeOfStart = new Date(
    //     dateOfClass + 'T' + visit.CLASSSTARTTIME
    //   );
    //   const datetimeOfEnd = new Date(dateOfClass + 'T' + visit.CLASSENDTIME);

    //   await this.eventService.create({
    //     data: {
    //       hostUserId: '0e86a56f-57f7-41e6-83ab-40f2c694a28e',
    //       datetimeOfStart: datetimeOfStart.toISOString(),
    //       datetimeOfEnd: datetimeOfEnd.toISOString(),
    //       year,
    //       month,
    //       dayOfMonth: datetimeOfStart.getDate(),
    //       dayOfWeek: datetimeOfStart.getDay(),
    //       hour: datetimeOfStart.getHours(),
    //       minute: datetimeOfStart.getMinutes(),
    //       minutesOfDuration: Number(
    //         (datetimeOfEnd.getTime() - datetimeOfStart.getTime()) / 60000
    //       ),
    //       typeId: 1,
    //       venueId,
    //       containerId: eventContainer.id,
    //     },
    //   });
    // }

    await this.eventContainerService.update({
      where: {id: eventContainer.id},
      data: {
        status: EventContainerStatus.PUBLISHED,
      },
    });
  }

  /* End */
}
