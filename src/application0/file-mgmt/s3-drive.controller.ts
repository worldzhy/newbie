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
import {Express, Request as ExpressRequest, Response} from 'express';
import {FileInterceptor} from '@nestjs/platform-express';
import {ApiBearerAuth, ApiBody, ApiParam, ApiTags} from '@nestjs/swagger';
import {ConfigService} from '@nestjs/config';
import {AccessTokenService} from '@microservices/account/security/token/access-token.service';
import {AwsS3Service} from '@microservices/cloud/saas/aws/aws-s3.service';
import {generateRandomLetters} from '@toolkit/utilities/common.util';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@ApiTags('File Management / S3 Drive')
@ApiBearerAuth()
@Controller('s3-drive')
export class S3DriveController {
  private s3Bucket: string;
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly s3: AwsS3Service,
    private readonly accessTokenService: AccessTokenService
  ) {
    this.s3Bucket = this.config.getOrThrow<string>(
      'microservice.file-mgmt.awsS3Bucket'
    );
  }

  @Post('files/upload')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: 'Upload file',
        value: {parentId: '189df21a-e601-487a-bdc8-edc044d37a42'},
      },
    },
  })
  @UseInterceptors(FileInterceptor('file')) // Receive file
  async uploadFile(
    @Body() body: {parentId: string},
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({fileType: 'pdf|doc|png|jpg|jpeg'})
        .build()
    )
    file: Express.Multer.File
  ) {
    // [step 1] Get workflow folder.
    const folder = await this.prisma.s3File.findUniqueOrThrow({
      where: {id: body.parentId},
      select: {name: true},
    });

    // [step 2] Generate file name and put file to AWS S3.
    const filename = Date.now() + generateRandomLetters(4);
    const s3Key = folder.name + '/' + filename;
    const output = await this.s3.putObject({
      Bucket: this.s3Bucket,
      Key: s3Key,
      Body: file.buffer,
    });

    // [step 3] Create a record.
    return await this.prisma.s3File.create({
      data: {
        name: file.originalname,
        type: file.mimetype,
        size: file.size,
        s3Bucket: this.s3Bucket,
        s3Key: s3Key,
        s3Response: output as object,
        parentId: body.parentId,
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
  async downloadFile(
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
    const output = await this.s3.getObject({
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

  @Get('files/:fileId/link')
  @ApiParam({
    name: 'fileId',
    schema: {type: 'string'},
    description: 'The uuid of the file.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getFileUrl(
    @Request() request: ExpressRequest,
    @Param('fileId') fileId: string
  ) {
    // [step 1] Get the file information.
    const file = await this.prisma.file.findUniqueOrThrow({
      where: {id: fileId},
      include: {folder: true},
    });

    const token = this.accessTokenService.getTokenFromHttpRequest(request);

    return {
      ...file,
      url:
        'https://' +
        this.config.getOrThrow<string>(
          'microservice.file-mgmt.awsCloudfrontDomain'
        ) +
        '/' +
        file.s3Key,
      token: token,
    };
  }

  @Post('files/folder')
  @ApiBody({
    description: '',
    examples: {
      a: {summary: '1. Create', value: {name: '', parentId: '[Optional]'}},
    },
  })
  async createFolder(@Body() body: {name: string; parentId?: string}) {
    return await this.prisma.s3File.create({
      data: {
        name: body.name,
        type: '',
        s3Bucket: this.s3Bucket,
        s3Key: '',
        s3Response: '',
        parentId: body.parentId,
      },
    });
  }

  @Get('files/:fileId/path')
  async getFilePath(@Param('fileId') fileId: string) {
    return await this.s3.getFilePath(fileId);
  }
  /* End */
}
