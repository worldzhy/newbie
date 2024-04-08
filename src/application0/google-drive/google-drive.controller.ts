import {
  Post,
  Body,
  Controller,
  Delete,
  Param,
  Get,
  Query,
  Patch,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {Express} from 'express';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {GoogleDriveService} from '@microservices/cloud/saas/google/google-drive.service';
import {GoogleAccountRole} from '@microservices/cloud/saas/google/enum';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {GoogleDrivePermissionService} from '@microservices/cloud/saas/google/google-drive-permission.service';

@ApiTags('Google Drive')
@ApiBearerAuth()
@Controller('google-drive')
export class GoogleDriveController {
  constructor(
    private readonly googleDrive: GoogleDriveService,
    private readonly googleDrivePermission: GoogleDrivePermissionService,
    private readonly prisma: PrismaService
  ) {}

  @Post('files/upload')
  @UseInterceptors(FileInterceptor('file'))
  async loadAvailabilityFile(
    // @UploadedFile(
    //   new ParseFilePipeBuilder()
    //     .addFileTypeValidator({
    //       fileType:
    //         'text/csv|application/vnd.ms-excel|application/msexcel|application/xls|application/x-xls|application/x-excel|application/x-dos_ms_excel|application/x-ms-excel|application/x-msexcel|application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    //     })
    //     .build()
    // )
    @UploadedFile() file: Express.Multer.File
  ) {
    await this.googleDrive.uploadFile(file.size);
  }

  @Post('files/folder')
  @ApiBody({
    description: '',
    examples: {
      a: {summary: '1. Create', value: {name: '', parentId: '[Optional]'}},
    },
  })
  async createFolder(@Body() body: {name: string; parentId?: string}) {
    return await this.googleDrive.createFolder(body);
  }

  @Post('files/document')
  @ApiBody({
    description: '',
    examples: {
      a: {summary: '1. Create', value: {name: '', parentId: '[Optional]'}},
    },
  })
  async createDocument(@Body() body: {name: string; parentId?: string}) {
    return await this.googleDrive.createDocument({
      name: body.name,
      parentId: body.parentId,
    });
  }

  @Post('files/spreadsheet')
  @ApiBody({
    description: '',
    examples: {
      a: {summary: '1. Create', value: {name: '', parentId: '[Optional]'}},
    },
  })
  async createSpreadsheet(@Body() body: {name: string; parentId?: string}) {
    return await this.googleDrive.createSheet({
      name: body.name,
      parentId: body.parentId,
    });
  }

  @Get('files/:fileId/path')
  async getFilePath(@Param('fileId') fileId: string) {
    return await this.googleDrive.getFilePath(fileId);
  }

  @Patch('files/:fileId/rename')
  @ApiBody({
    description: '',
    examples: {
      a: {summary: '1. Update', value: {name: ''}},
    },
  })
  async renameFile(
    @Param('fileId') fileId: string,
    @Body() body: {name: string}
  ) {
    return await this.googleDrive.renameFile({fileId, name: body.name});
  }

  @Delete('files/:fileId')
  async deleteFile(@Param('fileId') fileId: string) {
    return await this.googleDrive.deleteFile(fileId);
  }

  @Post('files/list')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. List',
        value: {page: 0, pageSize: 10, parentId: '[Optional]'},
      },
    },
  })
  async listFiles(
    @Body() body: {page: number; pageSize: number; parentId?: string}
  ) {
    return await this.googleDrive.listFiles(body);
  }

  @Post('permissions')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Share',
        value: {
          fileId: '',
          email: 'worldzhy@gmail.com',
          role: GoogleAccountRole.Writer,
        },
      },
    },
  })
  async createPermission(
    @Body() body: {fileId: string; email: string; role: GoogleAccountRole}
  ) {
    return await this.googleDrivePermission.createPermission(body);
  }

  @Get('permissions')
  async listPermissions(@Query('fileId') fileId: string) {
    return await this.prisma.googleFilePermission.findMany({
      where: {fileId: fileId},
    });
  }

  @Delete('permissions/:permissionId')
  async deletePermission(@Param('permissionId') permissionId: number) {
    return await this.googleDrivePermission.deletePermission(permissionId);
  }

  /* End */
}
