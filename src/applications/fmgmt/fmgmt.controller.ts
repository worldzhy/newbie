import {
  Controller,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
  StreamableFile,
  Res,
  Get,
  Param,
  BadRequestException,
} from '@nestjs/common';
import type {Response} from 'express';
import {FileInterceptor} from '@nestjs/platform-express';
import {ApiBearerAuth, ApiParam, ApiTags} from '@nestjs/swagger';
import {Express} from 'express';
import {diskStorage} from 'multer';
import {createReadStream} from 'fs';
import {getFileManagementConfig} from './fmgmt.config';
import {FileService} from './file/file.service';
import {S3Service} from '../../toolkits/aws/s3.service';
import {randomLetters} from '../../toolkits/utilities/common.util';

@ApiTags('[Application] File Management')
@ApiBearerAuth()
@Controller('file-management')
export class FileManagementController {
  private fileService = new FileService();
  private s3Service = new S3Service();

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'pdf|doc|png|jpg|jpeg',
        })
        .build()
    )
    file: Express.Multer.File
  ) {
    const bucket = getFileManagementConfig().s3_bucket!;

    // [step 1] Generate file name.
    const filename = Date.now() + randomLetters(4);

    // [step 2] Put file to AWS S3.
    const output = await this.s3Service.putObject({
      Bucket: bucket,
      Key: filename,
      Body: file.buffer,
    });

    // [step 3] Create a record.
    return await this.fileService.create({
      data: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        s3Bucket: bucket,
        s3Key: filename,
        s3Response: output as object,
      },
    });
  }

  @Get('download/:fileId')
  @ApiParam({
    name: 'fileId',
    schema: {type: 'string'},
    description: 'The uuid of the file.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async downloadFile(
    @Res({passthrough: true}) response: Response,
    @Param('fileId') fileId: string
  ) {
    // [step 1] Get the file information.
    const file = await this.fileService.findUniqueOrThrow({
      where: {id: fileId},
    });

    // [step 2] Set http response headers.
    response.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': 'attachment; filename=' + file.originalName,
    });

    // [step 3] Return file.
    const output = await this.s3Service.getObject({
      Bucket: file.s3Bucket,
      Key: file.s3Key,
    });

    if (output.Body) {
      const stream = await output.Body.transformToByteArray();
      return new StreamableFile(stream);
    } else {
      throw new BadRequestException('The file is empty.');
    }
  }

  @Post('local-upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: getFileManagementConfig().server_path,
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
    return await this.fileService.create({
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

  @Get('local-download/:fileId')
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
    const file = await this.fileService.findUniqueOrThrow({
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
