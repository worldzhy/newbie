import {Post, Body, Controller} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {GoogleSheetService} from '@microservices/googleapis/drive/sheet.service';
import {GoogleAccountRole} from '@microservices/googleapis/enum';

@ApiTags('File Management')
@ApiBearerAuth()
@Controller('file-mgmt/google-drive')
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

  @Post('create-sheet')
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
    return this.googleSheetService.create({
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
        value: {fileId: '', headings: ['name', 'gender', 'age', 'role']},
      },
    },
  })
  async updateSpreadsheetHeadings(
    @Body() body: {fileId: string; headings: string[]}
  ) {
    return this.googleSheetService.updateHeadings(body);
  }

  @Post('append-sheet-data')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {fileId: '', data: ['name', 'gender', 'age', 'role']},
      },
    },
  })
  async appendSpreadsheetData(@Body() body: {fileId: string; data: any[][]}) {
    return await this.googleSheetService.appendRows(body);
  }

  /* End */
}
