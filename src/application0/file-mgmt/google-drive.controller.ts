import {
  Post,
  Body,
  Controller,
  Delete,
  Param,
  Get,
  Query,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {GoogleDriveService} from '@microservices/googleapis/drive/drive.service';
import {GoogleAccountRole} from '@microservices/googleapis/enum';

@ApiTags('File Management')
@ApiBearerAuth()
@Controller('google-drive')
export class GoogleDriveController {
  constructor(private readonly googleDrive: GoogleDriveService) {}

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

  @Post('folders')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {name: '', parentFolderId: '[Optional]'},
      },
    },
  })
  async createFolder(@Body() body: {name: string; parentFolderId?: string}) {
    return this.googleDrive.createFolder(body);
  }

  @Delete('folders/:fileId')
  async deleteFolder(@Param('fileId') fileId: string) {
    return await this.googleDrive.deleteFile(fileId);
  }

  @Post('files')
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

  @Post('files/document')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {name: '', parentId: ''},
      },
    },
  })
  async createDocument(@Body() body: {name: string; parentId: string}) {
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
        value: {name: '', parentId: ''},
      },
    },
  })
  async createSpreadsheet(@Body() body: {name: string; parentId: string}) {
    return this.googleDrive.createSheet({
      name: body.name,
      parentId: body.parentId,
    });
  }

  @Delete('files/:fileId')
  async deleteFile(@Param('fileId') fileId: string) {
    return await this.googleDrive.deleteFile(fileId);
  }

  /* End */
}
