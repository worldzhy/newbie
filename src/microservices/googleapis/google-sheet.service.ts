import {Injectable} from '@nestjs/common';
import * as google from '@googleapis/sheets';
import {ConfigService} from '@nestjs/config';
import {
  generateRandomNumber,
  number2alphabet,
} from '@framework/utilities/common.util';

const DEFAULT_SHEET_TITLE = 'Sheet1';

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
export class GoogleSheetService {
  private client: google.sheets_v4.Sheets;

  constructor(private readonly config: ConfigService) {
    // Create a new JWT client using the key file downloaded from the Google Developer Console.
    const auth = new google.auth.GoogleAuth({
      keyFile: this.config.getOrThrow<string>(
        'microservices.googleapis.credentials.serviceAccount'
      ),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.client = google.sheets({version: 'v4', auth: auth});
  }

  /**************************************
   * Sheet Operations                   *
   **************************************/

  async addSheet(params: {
    fileId: string;
    properties: google.sheets_v4.Schema$SheetProperties;
    headings?: string[];
  }) {
    const response = await this.client.spreadsheets.batchUpdate({
      spreadsheetId: params.fileId,
      requestBody: {
        requests: [{addSheet: {properties: params.properties}}],
      },
    });
    console.log(response);
    // if (params.headings && params.headings.length > 0) {
    //   await this.updateRow({
    //     fileId: file.id,
    //     rowIndex: 1,
    //     rowData: params.headings,
    //   });
    // }
  }

  async clearSheet(params: {fileId: string; sheetTitle?: string}) {
    await this.client.spreadsheets.values.clear({
      spreadsheetId: params.fileId,
      range: params.sheetTitle ?? DEFAULT_SHEET_TITLE,
    });
  }

  async getSheetId(params: {fileId: string; sheetTitle?: string}) {
    const response = await this.client.spreadsheets.get({
      spreadsheetId: params.fileId,
    });
    if (response.data.sheets) {
      for (let i = 0; i < response.data.sheets.length; i++) {
        const sheet = response.data.sheets[i];
        if (
          sheet.properties?.title === (params.sheetTitle ?? DEFAULT_SHEET_TITLE)
        ) {
          return sheet.properties.sheetId;
        }
      }
    }
  }

  async updateHeadings(params: {
    fileId: string;
    sheetTitle?: string;
    headings: string[];
  }) {
    // [step 0] Get sheet id.
    const sheetId = await this.getSheetId({
      fileId: params.fileId,
      sheetTitle: params.sheetTitle ?? DEFAULT_SHEET_TITLE,
    });

    // [step 1] Update format.
    await this.client.spreadsheets.batchUpdate({
      spreadsheetId: params.fileId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
              },
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
              properties: {
                sheetId: sheetId,
                gridProperties: {frozenRowCount: 1},
              },
              fields: 'gridProperties.frozenRowCount',
            },
          },
        ],
      },
    });

    // [step 2] Update data.
    await this.updateRow({
      fileId: params.fileId,
      sheetTitle: params.sheetTitle ?? DEFAULT_SHEET_TITLE,
      rowIndex: 1,
      rowData: params.headings,
    });
  }

  /**************************************
   * Row Operations                     *
   **************************************/

  async getRows(params: {fileId: string; sheetTitle?: string}) {
    try {
      const response = await this.client.spreadsheets.values.get({
        spreadsheetId: params.fileId,
        range: `${params.sheetTitle ?? DEFAULT_SHEET_TITLE}`,
      });
      return response.data.values;
    } catch (err) {
      throw err;
    }
  }

  async appendRows(params: {
    fileId: string;
    sheetTitle?: string;
    data: any[][];
  }) {
    try {
      const response = await this.client.spreadsheets.values.append({
        spreadsheetId: params.fileId,
        valueInputOption: 'RAW',
        range: `${params.sheetTitle ?? DEFAULT_SHEET_TITLE}!A1`,
        requestBody: {values: params.data},
      });
      return response.data.spreadsheetId;
    } catch (err) {
      throw err;
    }
  }

  async updateRow(params: {
    fileId: string;
    sheetTitle?: string;
    rowIndex: number;
    rowData: string[];
  }) {
    try {
      const columnLetter = number2alphabet(params.rowData.length);
      const response = await this.client.spreadsheets.values.update({
        spreadsheetId: params.fileId,
        valueInputOption: 'RAW',
        range: `${params.sheetTitle ?? DEFAULT_SHEET_TITLE}!A${params.rowIndex}:${columnLetter}${params.rowIndex}`,
        requestBody: {values: [params.rowData]},
      });

      return response.data.spreadsheetId;
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
