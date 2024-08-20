import {Client} from '@googlemaps/google-maps-services-js';
import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Configuration} from '../../config/configuration.interface';

@Injectable()
export class GoogleMapsService {
  private logger = new Logger(GoogleMapsService.name);
  private client: Client;
  private config: {apiKey: any};

  constructor(private configService: ConfigService) {
    this.config =
      this.configService.getOrThrow<Configuration['googleMaps']>('googleMaps');

    if (this.config.apiKey) this.client = new Client();
    else this.logger.warn('Google Maps API key not found');
  }

  autocomplete(query: string, components?: string[]) {
    return this.client.placeAutocomplete({
      params: {
        input: query,
        key: this.config.apiKey,
        components,
      },
    });
  }
}
