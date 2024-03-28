import {Post, Body, Controller, Delete, Param} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {GoogleDriveService} from '@microservices/googleapis/drive/drive.service';
import {GoogleAccountRole} from '@microservices/googleapis/enum';

@ApiTags('File Management')
@ApiBearerAuth()
@Controller('google-drive')
export class GoogleDriveController {
  constructor(private readonly googleDrive: GoogleDriveService) {}

  @Post('files/folder')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {name: '', parentId: '[Optional]'},
      },
    },
  })
  async createFolder(@Body() body: {name: string; parentId?: string}) {
    return this.googleDrive.createFolder(body);
  }

  @Post('files/document')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {name: '', parentId: '[Optional]'},
      },
    },
  })
  async createDocument(@Body() body: {name: string; parentId?: string}) {
    return this.googleDrive.createDocument({
      name: body.name,
      parentId: body.parentId,
    });
  }

  @Post('files/spreadsheet')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {name: '', parentId: '[Optional]'},
      },
    },
  })
  async createSpreadsheet(@Body() body: {name: string; parentId?: string}) {
    return this.googleDrive.createSheet({
      name: body.name,
      parentId: body.parentId,
    });
  }

  @Delete('files/:fileId')
  async deleteFile(@Param('fileId') fileId: string) {
    return await this.googleDrive.deleteFile(fileId);
  }

  @Post('list')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. List',
        value: {parentId: '[Optional]'},
      },
    },
  })
  async listFiles(@Body() body: {parentId?: string}) {
    return await this.googleDrive.listFiles(body);
  }

  @Post('search')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Search',
        value: {name: ''},
      },
    },
  })
  async searchFiles(@Body() body: {name: string}) {
    return await this.googleDrive.searchFiles(body);
  }

  @Post('share')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Share',
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
    return this.googleDrive.share(body);
  }
  /* End */
}
