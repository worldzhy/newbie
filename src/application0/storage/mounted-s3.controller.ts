import {
  Controller,
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
  Delete,
} from '@nestjs/common';
import {Express, Request as ExpressRequest, Response} from 'express';
import {FileInterceptor} from '@nestjs/platform-express';
import {ApiBearerAuth, ApiBody, ApiParam, ApiTags} from '@nestjs/swagger';
import {ConfigService} from '@nestjs/config';
import {AccessTokenService} from '@microservices/account/security/token/access-token.service';
import {S3Service} from '@microservices/storage/s3/s3.service';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {Prisma} from '@prisma/client';

@ApiTags('Storage / Mounted S3')
@ApiBearerAuth()
@Controller('mounted-s3-drive')
export class MountedS3Controller {
  private s3Bucket: string;
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
    private readonly accessTokenService: AccessTokenService
  ) {
    this.s3Bucket = this.config.getOrThrow<string>(
      'microservice.storage.awsS3Bucket'
    );
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
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.S3File,
      pagination: {page: body.page, pageSize: body.pageSize},
      findManyArgs: {where: {parentId: body.parentId ?? null}},
    });
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
    @UploadedFile() file: Express.Multer.File,
    @Body() body: {parentId: string}
  ) {
    return await this.s3.uploadFile({
      bucket: this.s3Bucket,
      file,
      parentId: body.parentId,
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
    const file = await this.prisma.s3File.findUniqueOrThrow({
      where: {id: fileId},
    });

    // [step 2] Set http response headers.
    response.set({
      'Content-Type': file.type,
      'Content-Disposition': 'attachment; filename=' + file.name,
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
    const file = await this.prisma.s3File.findUniqueOrThrow({
      where: {id: fileId},
    });

    const token = this.accessTokenService.getTokenFromHttpRequest(request);

    return {
      ...file,
      url:
        'https://' +
        this.config.getOrThrow<string>(
          'microservice.storage.awsCloudfrontDomain'
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
    return await this.s3.createFolder({
      bucket: this.s3Bucket,
      name: body.name,
      parentId: body.parentId,
    });
  }

  @Get('files/:fileId/path')
  async getFilePath(@Param('fileId') fileId: string) {
    return await this.s3.getFilePath(fileId);
  }

  @Delete('files/:fileId')
  async deleteFile(@Param('fileId') fileId: string) {
    return await this.s3.deleteFile(fileId);
  }
  /* End */
}
