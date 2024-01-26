import {Injectable} from '@nestjs/common';
import * as google from '@googleapis/sheets';
import {ConfigService} from '@nestjs/config';
import {number2letters} from '@toolkit/utilities/common.util';

@Injectable()
export class GoogleSheetsService {
  private auth;

  constructor(private readonly configService: ConfigService) {
    // Create a new JWT client using the key file downloaded from the Google Developer Console.
    this.auth = new google.auth.GoogleAuth({
      keyFile: configService.getOrThrow<string>(
        'microservice.googleapis.credentials.serviceAccount'
      ),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  }

  async create(title: string) {
    const sheets = google.sheets({version: 'v4', auth: this.auth});
    try {
      const spreadsheet = await sheets.spreadsheets.create({
        requestBody: {properties: {title}},
      });
      return spreadsheet.data.spreadsheetId;
    } catch (err) {
      // TODO (developer) - Handle exception
      throw err;
    }
  }

  async updateHeadings(params: {spreadsheetId: string; headings: string[]}) {
    const sheets = google.sheets({version: 'v4', auth: this.auth});
    try {
      const columnLetter = number2letters(params.headings.length);
      const spreadsheet = await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: params.spreadsheetId,
        requestBody: {
          valueInputOption: 'RAW',
          data: [{range: `A1:${columnLetter}1`, values: [params.headings]}],
        },
      });
      return spreadsheet.data.spreadsheetId;
    } catch (err) {
      // TODO (developer) - Handle exception
      throw err;
    }
  }

  async updateData(params: {spreadsheetId: string; headings: string[]}) {
    const sheets = google.sheets({version: 'v4', auth: this.auth});
    try {
      const spreadsheet = await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: params.spreadsheetId,
        requestBody: {
          valueInputOption: 'RAW',
          data: [
            {
              range: '', // regex - https://developers.google.com/sheets/api/guides/concepts#cell
              values: [params.headings],
            },
          ],
        },
      });
      return spreadsheet.data.spreadsheetId;
    } catch (err) {
      // TODO (developer) - Handle exception
      throw err;
    }
  }

  /* End */
}
