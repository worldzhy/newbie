import {
  Controller,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
  Request,
  Get,
  Param,
  Body,
  Res,
  StreamableFile,
  BadRequestException,
} from '@nestjs/common';
import type {Response} from 'express';
import {FileInterceptor} from '@nestjs/platform-express';
import {ApiBearerAuth, ApiBody, ApiParam, ApiTags} from '@nestjs/swagger';
import {ConfigService} from '@nestjs/config';
import {Express} from 'express';
import {createReadStream} from 'fs';
import {diskStorage} from 'multer';
import {FileService} from '@microservices/file-mgmt/file/file.service';
import {FolderService} from '@microservices/file-mgmt/folder/folder.service';
import {AccessTokenService} from '@microservices/token/access-token/access-token.service';
import {S3Service} from '@toolkit/aws/aws.s3.service';
import {generateRandomLetters} from '@toolkit/utilities/common.util';

@ApiTags('[Microservice] File Management')
@ApiBearerAuth()
@Controller('file-mgmt')
export class FileManagementController {
  constructor(
    private readonly accessTokenService: AccessTokenService,
    private readonly fileService: FileService,
    private readonly s3Service: S3Service,
    private readonly folderService: FolderService,
    private readonly configService: ConfigService
  ) {}

  @Post('upload-to-cloud')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: 'Upload file',
        value: {folderId: 1},
      },
    },
  })
  @UseInterceptors(FileInterceptor('file')) // Receive file
  async uploadFile(
    @Body() body: {folderId: string},
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({fileType: 'pdf|doc|png|jpg|jpeg'})
        .build()
    )
    file: Express.Multer.File
  ) {
    // [step 1] Get workflow folder.
    const folder = await this.folderService.findUniqueOrThrow({
      where: {id: parseInt(body.folderId)},
    });

    // [step 2] Generate file name and put file to AWS S3.
    const filename = Date.now() + generateRandomLetters(4);
    const bucket = this.configService.getOrThrow<string>(
      'microservice.file-mgmt.awsS3Bucket'
    );
    const s3Key = folder.name + '/' + filename;
    const output = await this.s3Service.putObject({
      Bucket: bucket,
      Key: s3Key,
      Body: file.buffer,
    });

    // [step 3] Create a record.
    return await this.fileService.create({
      data: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        s3Bucket: bucket,
        s3Key: s3Key,
        s3Response: output as object,
        folderId: parseInt(body.folderId),
      },
    });
  }

  @Get('download-from-cloud/:fileId')
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

  @Get('link/:fileId')
  @ApiParam({
    name: 'fileId',
    schema: {type: 'string'},
    description: 'The uuid of the file.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getFileUrl(
    @Request() request: Request,
    @Param('fileId') fileId: string
  ) {
    // [step 1] Get the file information.
    const file = await this.fileService.findUniqueOrThrow({
      where: {id: fileId},
      include: {folder: true},
    });

    const token = this.accessTokenService.getTokenFromHttpRequest(request);

    return {
      ...file,
      url:
        'https://' +
        this.configService.getOrThrow<string>(
          'microservice.file-mgmt.awsCloudfrontDomain'
        ) +
        '/' +
        file.s3Key,
      token: token,
    };
  }

  @Post('upload-to-server')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.FILE_MANAGEMENT_LOCAL_PATH, // ! Why configService can not be used here?
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

  @Get('download-from-server/:fileId')
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
