import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Res,
  Body,
} from '@nestjs/common';
import {Express, Response} from 'express';
import {FileInterceptor} from '@nestjs/platform-express';
import {ApiBearerAuth, ApiBody, ApiParam, ApiTags} from '@nestjs/swagger';
import {diskStorage} from 'multer';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {Prisma} from '@prisma/client';
import {LocalDriveService} from '@microservices/storage/local/local-drive.service';

@ApiTags('Storage / Local')
@ApiBearerAuth()
@Controller('local-drive')
export class LocalDriveController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly localDrive: LocalDriveService
  ) {}

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
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.LocalFile,
      pagination: {page: body.page, pageSize: body.pageSize},
      findManyArgs: {where: {parentId: body.parentId ?? null}},
    });
  }

  @Post('files/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.STORAGE_LOCAL_PATH, // ! Why config can not be used here?
      }),
    })
  )
  async localUploadFile(@UploadedFile() file: Express.Multer.File) {
    return await this.prisma.localFile.create({
      data: {
        name: file.originalname,
        type: file.mimetype,
        size: file.size,
        parentId: file.path,
      },
    });
  }

  @Get('files/:fileId/download')
  @ApiParam({
    name: 'fileId',
    schema: {type: 'string'},
    description: 'The uuid of the file.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async localDownloadFile(
    @Res({passthrough: true}) response: Response,
    @Param('fileId') fileId: string
  ) {
    // [step 1] Get the file information.
    const file = await this.prisma.localFile.findUniqueOrThrow({
      where: {id: fileId},
    });

    // [step 2] Set http response headers.
    response.set({
      'Content-Type': file.type,
      'Content-Disposition': 'attachment; filename=' + file.name,
    });

    // [step 3] Return file.
    return await this.localDrive.downloadFile(fileId);
  }

  @Get('files/:fileId/path')
  async getFilePath(@Param('fileId') fileId: string) {
    return await this.localDrive.getFilePath(fileId);
  }

  /* End */
}
