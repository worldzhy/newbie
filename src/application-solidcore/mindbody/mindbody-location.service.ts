/* eslint-disable @typescript-eslint/no-explicit-any */
import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {HttpService} from '@nestjs/axios';
import {ConfigService} from '@nestjs/config';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {GoogleTimezoneService} from '@microservices/googleapis/timezone/timezone.service';
import {Prisma} from '@prisma/client';

@Injectable()
export class MindbodyLocationService {
  private apiKey: string;
  private username;
  private password;
  private mbUrl;
  private headers;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
    private readonly googleTimezoneService: GoogleTimezoneService
  ) {
    this.apiKey = this.configService.getOrThrow<string>(
      'microservice.mindbody.apiKey'
    );
    this.username = this.configService.get('microservice.mindbody.username');
    this.password = this.configService.get('microservice.mindbody.password');
    this.headers = {
      'Content-Type': 'application/json',
      'API-Key': this.apiKey,
    };
    this.mbUrl = this.configService.get('microservice.mindbody.mbUrl');
  }

  async getLocations() {
    const mindbodySites = await this.prisma.mindbodySite.findMany();
    const eventVenues: Prisma.EventVenueUncheckedCreateInput[] = [];
    for (let i = 0; i < mindbodySites.length; i++) {
      const mindbodySite = mindbodySites[i];
      try {
        this.headers['SiteId'] = mindbodySite.siteId;
        const response = await this.httpService.axiosRef.get(
          `${this.mbUrl}site/locations`,
          {headers: this.headers}
        );

        for (let j = 0; j < response.data.Locations.length; j++) {
          const location = response.data.Locations[j];
          console.log(location);

          const count = await this.prisma.eventVenue.count({
            where: {
              external_studioId: mindbodySite.siteId,
              external_locationId: location.Id,
            },
          });

          if (count === 0) {
            const timeZone = await this.googleTimezoneService.search(
              location.CITY + ',' + location.STATEPROVCODE
            );

            const place = await this.prisma.place.create({
              data: {
                address: location.Address,
                city: location.City,
                state: location.StateProvCode,
                timeZone,
              },
            });

            eventVenues.push({
              name: location.Name,
              placeId: place.id,
              external_studioId: mindbodySite.siteId,
              external_locationId: location.Id,
            });
          }
        }
      } catch (error) {}
    }

    await this.prisma.eventVenue.createMany({
      data: eventVenues,
    });
  }

  errorHandle(error) {
    if (error.response.status === 400) {
      return {
        success: false,
        data: error.response.data['Error'],
      };
    }
    throw new HttpException(
      JSON.stringify(error.response.data['Error']),
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }

  /* End */
}
