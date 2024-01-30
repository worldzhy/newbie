import {Injectable, InternalServerErrorException} from '@nestjs/common';
import * as google from '@googleapis/sheets';
import {ConfigService} from '@nestjs/config';
import {number2letters} from '@toolkit/utilities/common.util';
import {GoogleDriveService} from './drive.service';
import {GoogleMimeType} from '../enum';

/**
 * API parameters introduction
 *
 * range - https://developers.google.com/sheets/api/guides/concepts#cell
 * valueInputOption - https://developers.google.com/sheets/api/reference/rest/v4/ValueInputOption
 */

@Injectable()
export class GoogleSheetService extends GoogleDriveService {
  private client: google.sheets_v4.Sheets;

  constructor(private readonly configService: ConfigService) {
    super(configService, GoogleMimeType.Sheet);
    this.client = google.sheets({version: 'v4', auth: this.auth});
  }

  async create(params: {name: string; folderId?: string; headings?: string[]}) {
    const file = await this.createFile({
      name: params.name,
      folderId: params.folderId,
    });

    if (file.id) {
      if (params.headings && params.headings.length > 0) {
        await this.updateHeadings({
          spreadsheetId: file.id,
          headings: params.headings,
        });
      }
    } else {
      throw new InternalServerErrorException('Create google sheet failed.');
    }

    return file.id;
  }

  async updateHeadings(params: {spreadsheetId: string; headings: string[]}) {
    try {
      const columnLetter = number2letters(params.headings.length);
      const spreadsheet = await this.client.spreadsheets.values.update({
        spreadsheetId: params.spreadsheetId,
        valueInputOption: 'RAW',
        range: `A1:${columnLetter}1`,
        requestBody: {values: [params.headings]},
      });

      return spreadsheet.data.spreadsheetId;
    } catch (err) {
      throw err;
    }
  }

  async appendRows(params: {spreadsheetId: string; data: any[][]}) {
    try {
      const spreadsheet = await this.client.spreadsheets.values.append({
        spreadsheetId: params.spreadsheetId,
        valueInputOption: 'RAW',
        range: 'A1',
        requestBody: {values: params.data},
      });
      return spreadsheet.data.spreadsheetId;
    } catch (err) {
      throw err;
    }
  }

  async getRows(params: {fileId?: string; headings?: []}) {
    const spreadsheet = await this.client.spreadsheets.get({
      spreadsheetId: params.fileId,
    });
    if (!spreadsheet.data.sheets || spreadsheet.data.sheets.length === 0) {
      throw new InternalServerErrorException('Get google sheet failed');
    }

    const sheet = spreadsheet.data.sheets[0];
    console.log(sheet);

    const file = await this.client.spreadsheets.values.get({
      spreadsheetId: params.fileId,
      range: sheet.properties?.title!,
    });

    return file.data.values;
  }

  /* End */
}
