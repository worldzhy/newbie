import {Post, Body, Controller} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {GoogleSheetService} from '@microservices/googleapis/drive/sheet.service';
import {GoogleAccountRole} from '@microservices/googleapis/enum';

@ApiTags('Google Drive')
@ApiBearerAuth()
@Controller('google-drive')
export class GoogleDriveController {
  constructor(private readonly googleSheetService: GoogleSheetService) {}

  @Post('share')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          fileId: '',
          gmail: 'worldzhy@gmail.com',
          role: GoogleAccountRole.Writer,
        },
      },
    },
  })
  async share(
    @Body() body: {fileId: string; gmail: string; role: GoogleAccountRole}
  ) {
    return this.googleSheetService.share(body);
  }

  @Post('create-folder')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {name: '', parentFolderId: '[Optional]'},
      },
    },
  })
  async createFolder(@Body() body: {name: string; parentFolderId?: string}) {
    return this.googleSheetService.createFolder(body);
  }

  @Post('create-spreadsheet')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {name: '', folderId: ''},
      },
    },
  })
  async createSpreadsheet(@Body() body: {name: string; folderId: string}) {
    return this.googleSheetService.create({
      name: body.name,
      folderId: body.folderId,
    });
  }

  @Post('update-spreadsheet-headings')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {spreadsheetId: '', headings: ['name', 'gender', 'age', 'role']},
      },
    },
  })
  async updateSpreadsheetHeadings(
    @Body() body: {spreadsheetId: string; headings: string[]}
  ) {
    return this.googleSheetService.updateHeadings(body);
  }

  @Post('update-spreadsheet-data')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {spreadsheetId: '', headings: ['name', 'gender', 'age', 'role']},
      },
    },
  })
  async updateSpreadsheetData(
    @Body() body: {spreadsheetId: string; headings: string[]}
  ) {
    return this.googleSheetService.updateData(body);
  }

  /* End */
}
