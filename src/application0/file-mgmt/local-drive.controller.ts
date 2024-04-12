import {
  Controller,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Res,
  StreamableFile,
  BadRequestException,
  Body,
} from '@nestjs/common';
import {Express, Response} from 'express';
import {FileInterceptor} from '@nestjs/platform-express';
import {ApiBearerAuth, ApiBody, ApiParam, ApiTags} from '@nestjs/swagger';
import {createReadStream} from 'fs';
import {diskStorage} from 'multer';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {Prisma} from '@prisma/client';

@ApiTags('File Management / Local Drive')
@ApiBearerAuth()
@Controller('local-drive')
export class LocalDriveController {
  constructor(private readonly prisma: PrismaService) {}

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
      model: Prisma.ModelName.File,
      pagination: {page: body.page, pageSize: body.pageSize},
      findManyArgs: {where: {parentId: body.parentId ?? null}},
    });
  }

  @Post('files/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.FILE_MANAGEMENT_LOCAL_DRIVE_PATH, // ! Why config can not be used here?
      }),
    })
  )
  async localUploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'pdf|doc|png|jpg|jpeg',
        })
        .build()
    )
    file: Express.Multer.File
  ) {
    return await this.prisma.file.create({
      data: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        localPath: file.path,
        localName: file.filename,
        s3Bucket: '',
        s3Key: '',
        s3Response: '',
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
    const file = await this.prisma.file.findUniqueOrThrow({
      where: {id: fileId},
    });

    // [step 2] Set http response headers.
    response.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': 'attachment; filename=' + file.originalName,
    });

    // [step 3] Return file.
    if (file.localPath) {
      const stream = createReadStream(file.localPath);
      return new StreamableFile(stream);
    } else {
      throw new BadRequestException(
        'Did not find the file. Please contact administrator.'
      );
    }
  }

  /* End */
}
