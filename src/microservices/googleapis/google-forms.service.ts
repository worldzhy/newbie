import {Injectable} from '@nestjs/common';
import * as google from '@googleapis/forms';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class GoogleFormsService {
  private auth;

  constructor(private readonly configService: ConfigService) {
    // Create a new JWT client using the key file downloaded from the Google Developer Console.
    this.auth = new google.auth.GoogleAuth({
      keyFile: configService.getOrThrow<string>(
        'microservice.googleapis.credentials.serviceAccount'
      ),
      scopes: [
        'https://www.googleapis.com/auth/forms.body.readonly',
        'https://www.googleapis.com/auth/forms.responses.readonly',
      ],
    });
  }

  async getFormItems(formId: string) {
    const forms = google.forms({version: 'v1', auth: this.auth});
    const result = await forms.forms.get({formId});

    return result.data.items || [];
  }

  async getFormResponses(formId: string) {
    const forms = google.forms({version: 'v1', auth: this.auth});
    const result = await forms.forms.responses.list({formId});

    const responses = result.data.responses;
    if (responses) {
      for (let i = 0; i < responses.length; i++) {
        const response = responses[i];
        const answers = response.answers;
        for (let key in answers) {
          const answer = answers[key];
          answer.questionId;
        }
      }
    }

    return responses || [];
  }

  /* End */
}
