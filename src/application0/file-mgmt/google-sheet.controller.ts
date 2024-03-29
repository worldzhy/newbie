import {Post, Body, Controller} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {GoogleSheetService} from '@microservices/googleapis/sheet/sheet.service';

@ApiTags('File Management')
@ApiBearerAuth()
@Controller('google-sheet')
export class GoogleSheetController {
  constructor(private readonly googleSheet: GoogleSheetService) {}

  @Post('update-sheet-headings')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          fileId: '',
          sheetTitle: 'Sheet1',
          headings: ['name', 'gender', 'age', 'role'],
        },
      },
    },
  })
  async updateSpreadsheetHeadings(
    @Body() body: {fileId: string; sheetTitle: string; headings: string[]}
  ) {
    return this.googleSheet.updateHeadings(body);
  }

  @Post('append-sheet-data')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          fileId: '',
          sheetTitle: 'Sheet1',
          data: ['name', 'gender', 'age', 'role'],
        },
      },
    },
  })
  async appendSpreadsheetData(
    @Body() body: {fileId: string; sheetTitle: string; data: any[][]}
  ) {
    return await this.googleSheet.appendRows(body);
  }

  /* End */
}
