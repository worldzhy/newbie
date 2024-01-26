import {Post, Body, Controller} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {GoogleSheetsService} from '@microservices/googleapis/google-sheets.service';
import {
  GoogleDriveRole,
  GoogleDriveService,
  GoogleMimeType,
} from '@microservices/googleapis/google-drive.service';

@ApiTags('Google Drive')
@ApiBearerAuth()
@Controller('google-drive')
export class GoogleDriveController {
  constructor(
    private readonly googleSheetsService: GoogleSheetsService,
    private readonly googleDriveService: GoogleDriveService
  ) {}

  @Post('share')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          fileId: '',
          gmail: 'worldzhy@gmail.com',
          role: GoogleDriveRole.Writer,
        },
      },
    },
  })
  async share(
    @Body() body: {fileId: string; gmail: string; role: GoogleDriveRole}
  ) {
    return this.googleDriveService.share(body);
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
    return this.googleDriveService.createFolder(body);
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
    return this.googleDriveService.createFile({
      type: GoogleMimeType.Sheet,
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
    return this.googleSheetsService.updateHeadings(body);
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
    return this.googleSheetsService.updateData(body);
  }

  /* End */
}
