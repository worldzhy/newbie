import {Injectable} from '@nestjs/common';
import * as google from '@googleapis/sheets';
import {ConfigService} from '@nestjs/config';
import {number2letters} from '@toolkit/utilities/common.util';
import {GoogleDriveService} from './drive.service';
import {GoogleMimeType} from '../enum';

@Injectable()
export class GoogleSheetService extends GoogleDriveService {
  private client: google.sheets_v4.Sheets;

  constructor(private readonly configService: ConfigService) {
    super(configService, GoogleMimeType.Sheet);
    this.client = google.sheets({version: 'v4', auth: this.auth});
  }

  async create(params: {name: string; folderId: string}) {
    return await this.createFile({
      name: params.name,
      folderId: params.folderId,
    });
  }

  async updateHeadings(params: {spreadsheetId: string; headings: string[]}) {
    try {
      const columnLetter = number2letters(params.headings.length);
      const spreadsheet = await this.client.spreadsheets.values.batchUpdate({
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
    try {
      const spreadsheet = await this.client.spreadsheets.values.batchUpdate({
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
