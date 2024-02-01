import {Injectable, InternalServerErrorException} from '@nestjs/common';
import * as google from '@googleapis/sheets';
import {ConfigService} from '@nestjs/config';
import {
  generateRandomNumber,
  number2letters,
} from '@toolkit/utilities/common.util';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {GoogleDriveService} from './drive.service';
import {GoogleFileType} from '../enum';

/**
 * API parameters introduction
 *
 * range - https://developers.google.com/sheets/api/guides/concepts#cell
 * valueInputOption - https://developers.google.com/sheets/api/reference/rest/v4/ValueInputOption
 * themeColor - https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/other#ThemeColorType
 */

/**
 * Samples
 *
 * Row & column operations - https://developers.google.com/sheets/api/samples/rowcolumn
 * Formatting - https://developers.google.com/sheets/api/samples/formatting
 */

@Injectable()
export class GoogleSheetService extends GoogleDriveService {
  private client: google.sheets_v4.Sheets;

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService
  ) {
    super(configService, prismaService, GoogleFileType.Sheet);
    this.client = google.sheets({version: 'v4', auth: this.auth});
  }

  /**************************************
   * Sheet Operations                     *
   **************************************/

  async create(params: {name: string; parentId?: string; headings?: string[]}) {
    const file = await this.createFile({
      name: params.name,
      parentId: params.parentId,
    });

    if (params.headings && params.headings.length > 0) {
      await this.updateRow({
        fileId: file.id,
        rowIndex: 1,
        rowData: params.headings,
      });
    }

    return file;
  }

  async clearSheet(fileId: string) {
    const spreadsheet = await this.client.spreadsheets.get({
      spreadsheetId: fileId,
    });
    if (!spreadsheet.data.sheets || spreadsheet.data.sheets.length === 0) {
      throw new InternalServerErrorException('Get google sheet failed');
    }
    const sheet = spreadsheet.data.sheets[0];

    await this.client.spreadsheets.values.clear({
      spreadsheetId: fileId,
      range: sheet.properties?.title!,
    });
  }

  async updateHeadings(params: {fileId: string; headings: string[]}) {
    // [step 1] Update format.
    await this.client.spreadsheets.batchUpdate({
      spreadsheetId: params.fileId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {sheetId: 0, startRowIndex: 0, endRowIndex: 1},
              cell: {
                userEnteredFormat: {
                  backgroundColorStyle: {themeColor: 'BACKGROUND'},
                  horizontalAlignment: 'LEFT',
                  textFormat: {
                    foregroundColorStyle: {
                      themeColor: `ACCENT${generateRandomNumber(6) ?? 1}`,
                    },
                    fontSize: 12,
                  },
                },
              },
              fields:
                'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
            },
          },
          {
            updateSheetProperties: {
              properties: {sheetId: 0, gridProperties: {frozenRowCount: 1}},
              fields: 'gridProperties.frozenRowCount',
            },
          },
        ],
      },
    });

    // [step 2] Update data.
    await this.updateRow({
      fileId: params.fileId,
      rowIndex: 1,
      rowData: params.headings,
    });
  }

  /**************************************
   * Row Operations                     *
   **************************************/

  async getRows(params: {fileId: string; startIndex?: number; count?: number}) {
    const spreadsheet = await this.client.spreadsheets.get({
      spreadsheetId: params.fileId,
    });
    if (!spreadsheet.data.sheets || spreadsheet.data.sheets.length === 0) {
      throw new InternalServerErrorException('Get google sheet failed');
    }
    const sheet = spreadsheet.data.sheets[0];

    const file = await this.client.spreadsheets.values.get({
      spreadsheetId: params.fileId,
      range: sheet.properties?.title!,
    });

    return file.data.values;
  }

  async appendRows(params: {fileId: string; data: any[][]}) {
    try {
      const spreadsheet = await this.client.spreadsheets.values.append({
        spreadsheetId: params.fileId,
        valueInputOption: 'RAW',
        range: 'A1',
        requestBody: {values: params.data},
      });
      return spreadsheet.data.spreadsheetId;
    } catch (err) {
      throw err;
    }
  }

  async updateRow(params: {
    fileId: string;
    rowIndex: number;
    rowData: string[];
  }) {
    try {
      const columnLetter = number2letters(params.rowData.length);
      const spreadsheet = await this.client.spreadsheets.values.update({
        spreadsheetId: params.fileId,
        valueInputOption: 'RAW',
        range: `A${params.rowIndex}:${columnLetter}${params.rowIndex}`,
        requestBody: {values: [params.rowData]},
      });

      return spreadsheet.data.spreadsheetId;
    } catch (err) {
      throw err;
    }
  }

  async deleteRows(params: {
    fileId: string;
    startIndex: number;
    endIndex: number;
  }) {
    try {
      const spreadsheet = await this.client.spreadsheets.batchUpdate({
        spreadsheetId: params.fileId,
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: 0,
                  dimension: 'ROWS',
                  startIndex: params.startIndex,
                  endIndex: params.endIndex,
                },
              },
            },
          ],
        },
      });
      return spreadsheet.data.spreadsheetId;
    } catch (err) {
      throw err;
    }
  }

  /**************************************
   * Column Operations                  *
   **************************************/

  async deleteColumns(params: {
    fileId: string;
    startIndex: number;
    endIndex: number;
  }) {
    try {
      const spreadsheet = await this.client.spreadsheets.batchUpdate({
        spreadsheetId: params.fileId,
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: 0,
                  dimension: 'COLUMNS',
                  startIndex: params.startIndex,
                  endIndex: params.endIndex,
                },
              },
            },
          ],
        },
      });
      return spreadsheet.data.spreadsheetId;
    } catch (err) {
      throw err;
    }
  }

  async resizeColumms(params: {
    fileId: string;
    startIndex: number;
    endIndex: number;
    pixelSize?: number;
  }) {
    const requests: object[] = [];
    if (params.pixelSize) {
      requests.push({
        updateDimensionProperties: {
          range: {
            sheetId: 0,
            dimension: 'COLUMNS',
            startIndex: params.startIndex,
            endIndex: params.endIndex,
          },
          properties: {pixelSize: params.pixelSize},
          fields: 'pixelSize',
        },
      });
    } else {
      requests.push({
        autoResizeDimensions: {
          dimensions: {
            sheetId: 0,
            dimension: 'COLUMNS',
            startIndex: params.startIndex,
            endIndex: params.endIndex,
          },
        },
      });
    }

    try {
      const spreadsheet = await this.client.spreadsheets.batchUpdate({
        spreadsheetId: params.fileId,
        requestBody: {requests: requests},
      });
      return spreadsheet.data.spreadsheetId;
    } catch (err) {
      throw err;
    }
  }

  // ! This function is ineffective.
  async hideColumns(params: {
    fileId: string;
    startIndex: number;
    endIndex: number;
  }) {
    try {
      const spreadsheet = await this.client.spreadsheets.batchUpdate({
        spreadsheetId: params.fileId,
        requestBody: {
          requests: [
            {
              updateDimensionProperties: {
                range: {
                  sheetId: 0,
                  dimension: 'COLUMNS',
                  startIndex: params.startIndex,
                  endIndex: params.endIndex,
                },
                properties: {hiddenByUser: true},
                fields: 'hiddenByUser',
              },
            },
          ],
        },
      });
      return spreadsheet.data.spreadsheetId;
    } catch (err) {
      throw err;
    }
  }

  /* End */
}
