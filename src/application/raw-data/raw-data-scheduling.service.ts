import {Injectable} from '@nestjs/common';
import {UserService} from '@microservices/account/user/user.service';
import {EventService} from '@microservices/event-scheduling/event.service';
import {EventTypeService} from '@microservices/event-scheduling/event-type.service';
import {EventVenueService} from '@microservices/event-scheduling/event-venue.service';
import {EventContainerService} from '@microservices/event-scheduling/event-container.service';
import {SnowflakeService} from '@toolkit/snowflake/snowflake.service';
import {EventContainerOrigin, EventContainerStatus} from '@prisma/client';
import {weekOfMonth, weekOfYear} from '@toolkit/utilities/datetime.util';

@Injectable()
export class RawDataSchedulingService {
  constructor(
    private readonly snowflakeService: SnowflakeService,
    private readonly eventService: EventService,
    private readonly eventTypeService: EventTypeService,
    private readonly eventVenueService: EventVenueService,
    private readonly eventContainerService: EventContainerService,
    private readonly userService: UserService
  ) {}

  async synchronize(params: {venueId: number; year: number; month: number}) {
    const {venueId, year, month} = params;

    // [step 1] Get event venue.
    const venue = await this.eventVenueService.findUniqueOrThrow({
      where: {id: venueId},
    });

    // [step 2] Check if the data has been fetched.
    let count = await this.eventContainerService.count({
      where: {
        origin: EventContainerOrigin.EXTERNAL,
        status: EventContainerStatus.PUBLISHED,
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

    if (visits.length > 0) {
      await this.eventService.createMany({
        data: (
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
                const datetimeOfStart = new Date(
                  dateOfClass + 'T' + visit.CLASSSTARTTIME
                );
                const datetimeOfEnd = new Date(
                  dateOfClass + 'T' + visit.CLASSENDTIME
                );

                // Get coach info
                if (!visit.TREMAILNAME) {
                  return;
                }
                if (visit.TREMAILNAME.endsWith('.')) {
                  visit.TREMAILNAME = visit.TREMAILNAME.slice(0, -1);
                }
                const coach = await this.userService.findUnique({
                  where: {email: visit.TREMAILNAME},
                  select: {id: true},
                });

                // Get class info
                visit.CLASSNAME = visit.CLASSNAME.replace('  ', ' ').trim();
                if (visit.CLASSNAME.includes('+')) {
                  const splittedName = visit.CLASSNAME.split('+');
                  visit.CLASSNAME =
                    splittedName[0].trim() + ' + ' + splittedName[1].trim();
                }
                const eventType = await this.eventTypeService.match(
                  visit.CLASSNAME
                );

                return {
                  hostUserId: coach ? coach.id : null,
                  datetimeOfStart: datetimeOfStart.toISOString(),
                  datetimeOfEnd: datetimeOfEnd.toISOString(),
                  year,
                  month,
                  dayOfMonth: datetimeOfStart.getDate(),
                  dayOfWeek: datetimeOfStart.getDay(),
                  weekOfMonth: weekOfMonth(
                    year,
                    month,
                    datetimeOfStart.getDate()
                  ),
                  weekOfYear: weekOfYear(
                    year,
                    month,
                    datetimeOfStart.getDate()
                  ),
                  hour: datetimeOfStart.getHours(),
                  minute: datetimeOfStart.getMinutes(),
                  minutesOfDuration: Number(
                    (datetimeOfEnd.getTime() - datetimeOfStart.getTime()) /
                      60000
                  ),
                  typeId: eventType.id,
                  venueId,
                  containerId: eventContainer.id,
                };
              }
            )
          )
        ).filter(element => {
          return element !== null && element !== undefined;
        }),
      });

      await this.eventContainerService.update({
        where: {id: eventContainer.id},
        data: {
          status: EventContainerStatus.PUBLISHED,
        },
      });
    } else {
      await this.eventContainerService.delete({
        where: {id: eventContainer.id},
      });
    }
  }

  /* End */
}
