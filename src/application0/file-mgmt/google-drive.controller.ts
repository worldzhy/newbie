import {Post, Body, Controller} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {GoogleSpreadsheetService} from '@microservices/googleapis/drive/spreadsheet.service';
import {GoogleAccountRole} from '@microservices/googleapis/enum';

@ApiTags('File Management')
@ApiBearerAuth()
@Controller('file-mgmt/google-drive')
export class GoogleDriveController {
  constructor(private readonly spreadsheetService: GoogleSpreadsheetService) {}

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
    return this.spreadsheetService.share(body);
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
    return this.spreadsheetService.createFolder(body);
  }

  @Post('create-spreadsheet')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {name: '', parentId: ''},
      },
    },
  })
  async createSpreadsheet(@Body() body: {name: string; parentId: string}) {
    return this.spreadsheetService.createSpreadsheet({
      name: body.name,
      parentId: body.parentId,
    });
  }

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
    return this.spreadsheetService.updateHeadings(body);
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
    return await this.spreadsheetService.appendRows(body);
  }

  /* End */
}
