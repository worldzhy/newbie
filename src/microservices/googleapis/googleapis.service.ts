import * as google from '@googleapis/drive';
import {ConfigService} from '@nestjs/config';
import {GoogleAuth} from 'google-auth-library';

export abstract class GoogleApisService {
  protected auth: GoogleAuth;

  constructor(private readonly conf: ConfigService) {
    // Create a new JWT client using the key file downloaded from the Google Developer Console.
    this.auth = new google.auth.GoogleAuth({
      keyFile: this.conf.getOrThrow<string>(
        'microservice.googleapis.credentials.serviceAccount'
      ),
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/forms',
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    });
  }

  /* End */
}
