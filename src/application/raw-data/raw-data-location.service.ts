import {Injectable} from '@nestjs/common';
import {UserService} from '@microservices/account/user/user.service';
import {UserProfileService} from '@microservices/account/user/user-profile.service';
import {EventVenueService} from '@microservices/event-scheduling/event-venue.service';
import {PlaceService} from '@microservices/map/place.service';
import {SnowflakeService} from '@toolkit/snowflake/snowflake.service';

const ROLE_NAME_COACH = 'Coach';

@Injectable()
export class RawDataLocationService {
  constructor(
    private readonly snowflakeService: SnowflakeService,
    private readonly eventVenueService: EventVenueService,
    private readonly placeService: PlaceService,
    private readonly userService: UserService,
    private readonly userProfileService: UserProfileService
  ) {}

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

  /* End */
}
