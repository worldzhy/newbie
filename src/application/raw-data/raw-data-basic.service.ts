import {Injectable} from '@nestjs/common';
import {UserService} from '@microservices/account/user/user.service';
import {UserProfileService} from '@microservices/account/user/user-profile.service';
import {EventVenueService} from '@microservices/event-scheduling/event-venue.service';
import {PlaceService} from '@microservices/map/place.service';
import {SnowflakeService} from '@toolkit/snowflake/snowflake.service';

const ROLE_NAME_COACH = 'Coach';

@Injectable()
export class RawDataBasicService {
  constructor(
    private readonly snowflakeService: SnowflakeService,
    private readonly eventVenueService: EventVenueService,
    private readonly placeService: PlaceService,
    private readonly userService: UserService,
    private readonly userProfileService: UserProfileService
  ) {}

  async syncCoaches() {
    const sqlText = `
    select distinct lower(tremailname) as tremailname, trfirstname, trlastname 
    from mindbodyorg_mindbody_sldcor_mbo_secure_views.mb.trainers 
    where active=true and deleted=false and trainerid > 100000000 and studioid > 0 and teacher = true and tremailname is not null;
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

  async syncLocations() {
    const sqlText = `
    select
      s.studioid,
      s.studioname,
      s.stateprovcode,
      l.locationid,
      l.locationname,
      l.address,
      l.city,
      l.country
    from
      studios as s
      left join location as l on l.studioid = s.studioid and l.stateprovcode = s.stateprovcode
    where 
      l.active = true and l.softdeleted = false
    group by 
      s.studioid,
      s.studioname,
      s.stateprovcode,
      l.locationid,
      l.locationname,
      l.address,
      l.city,
      l.country
    order by
      s.stateprovcode,
      s.studioid,
      l.locationname;
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

  async linkCoachAndLocations() {
    const sqlText = `
    select 
      lower(t.tremailname) as tremailname, 
      l.studioid, 
      l.locationid
    from 
      trainers as t
      left join location as l on t.studioid = l.studioid and t.location = l.locationid
    where 
      l.active = true and l.softdeleted = false and l.studioid > 0 and t.studioid > 0 and t.active=true and t.deleted=false and t.softdeleted = false and teacher = true and t.trainerid > 100000000 and t.tremailname is not null
    group by 
      t.tremailname, l.studioid, l.locationid
    order by 
      t.tremailname asc, l.studioid asc, l.locationid asc
    `;

    const options = {
      sqlText,
    };

    // [step 1] Fetch raw data.
    const coachAndLocations: any = await this.snowflakeService.execute(options);

    // [step 2] Get all the coaches. The total count of coaches is about x thousands.
    const coaches = await this.userService.findMany({
      where: {email: {not: null}, roles: {some: {name: ROLE_NAME_COACH}}},
      select: {
        email: true,
        profile: {select: {id: true, eventVenueIds: true}},
      },
      orderBy: {email: 'asc'},
    });

    // https://stackoverflow.com/questions/19874555/how-do-i-convert-array-of-objects-into-one-object-in-javascript
    const emailAndLocationIdsMapping = coaches.reduce(
      (obj, item) =>
        Object.assign(obj, {[item.email!]: item['profile']['eventVenueIds']}),
      {}
    );
    const emailAndProfileIdMapping = coaches.reduce(
      (obj, item) => Object.assign(obj, {[item.email!]: item['profile']['id']}),
      {}
    );

    // [step 3] Get all the locations. The total count of locations is about x hundreds.
    const locations = await this.eventVenueService.findMany({
      select: {
        id: true,
        external_locationId: true,
        external_studioId: true,
      },
    });

    // [step 4] Link coach and locations.
    for (let i = 0; i < coachAndLocations.length; i++) {
      const coachAndLocation = coachAndLocations[i];

      if ((coachAndLocation.TREMAILNAME as string).endsWith('.')) {
        coachAndLocation.TREMAILNAME = coachAndLocation.TREMAILNAME.slice(
          0,
          -1
        );
      }

      for (let j = 0; j < locations.length; j++) {
        const location = locations[j];
        if (
          location.external_studioId === coachAndLocation.STUDIOID &&
          location.external_locationId === coachAndLocation.LOCATIONID
        ) {
          if (coachAndLocation.TREMAILNAME in emailAndLocationIdsMapping) {
            emailAndLocationIdsMapping[coachAndLocation.TREMAILNAME].push(
              location.id
            );
          }
        }
      }
    }

    // [step 5] Update coach eventVenueIds.
    for (const email in emailAndLocationIdsMapping) {
      if (emailAndLocationIdsMapping[email].length > 0) {
        await this.userProfileService.update({
          where: {id: emailAndProfileIdMapping[email]},
          data: {eventVenueIds: emailAndLocationIdsMapping[email]},
        });
      }
    }
  }

  async linkCoachAndClassTypes() {}

  /* End */
}