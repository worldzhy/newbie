import {Client} from '@googlemaps/google-maps-services-js';
import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class GoogleMapsService {
  private logger = new Logger(GoogleMapsService.name);
  private client: Client;

  constructor(private configService: ConfigService) {
    const config = this.configService.getOrThrow(
      'microservices.saas-starter.googleMaps'
    );

    if (config.apiKey) this.client = new Client();
    else this.logger.warn('Google Maps API key not found');
  }

  autocomplete(query: string, components?: string[]) {
    const config = this.configService.getOrThrow(
      'microservices.saas-starter.googleMaps'
    );

    return this.client.placeAutocomplete({
      params: {
        input: query,
        key: config.apiKey,
        components,
      },
    });
  }
}
