import {Injectable} from '@nestjs/common';
import * as google from '@googleapis/forms';
import {ConfigService} from '@nestjs/config';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {GoogleDriveService} from './drive.service';
import {GoogleFileType} from '../enum';

@Injectable()
export class GoogleFormService extends GoogleDriveService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService
  ) {
    super(configService, prismaService, GoogleFileType.Form);
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
