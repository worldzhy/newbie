import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  StreamableFile,
  Res,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {FileService} from './file.service';
import {Prisma, File} from '@prisma/client';
import type {Response} from 'express';

@ApiTags('[Application] File Management / File')
@ApiBearerAuth()
@Controller('files')
export class FileController {
  private fileService = new FileService();

  @Get(':fileId/download')
  @ApiParam({
    name: 'fileId',
    schema: {type: 'string'},
    description: 'The uuid of the file.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async downloadFile(
    @Res({passthrough: true}) response: Response,
    @Param('fileId') fileId: string
  ): Promise<StreamableFile> {
    // [step 1] Get the file information.
    const file = await this.fileService.findUniqueOrThrow({
      where: {id: fileId},
    });

    // [step 2] Set http response headers.
    response.set({
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename=' + file.name,
    });

    // [step 3] Return file entity.
    return this.fileService.read(file);
  }

  @Post('')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'example-file-name',
          url: 'https://i0.wp.com/windingroad.com/wp-content/uploads/2022/09/6-Arai-GP-5W.png?w=1200&ssl=1',
          mimeType: 'jpg',
          s3Bucket: 'example-s3-bucket',
          s3Path: '',
        },
      },
    },
  })
  async createFile(@Body() body: Prisma.FileCreateInput): Promise<File> {
    return await this.fileService.create({data: body});
  }

  @Get('')
  async getFiles(): Promise<File[]> {
    return await this.fileService.findMany({});
  }

  @Get(':fileId')
  @ApiParam({
    name: 'fileId',
    schema: {type: 'string'},
    description: 'The uuid of the file.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getFile(@Param('fileId') fileId: string): Promise<File | null> {
    return await this.fileService.findUnique({
      where: {id: fileId},
    });
  }

  @Patch(':fileId')
  @ApiParam({
    name: 'fileId',
    schema: {type: 'string'},
    description: 'The uuid of the file.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  @ApiBody({
    description:
      "The 'fileName', 'clientName' and 'clientEmail' are required in request body.",
    examples: {
      a: {
        summary: '1. Update',
        value: {
          name: 'Galaxy',
        },
      },
    },
  })
  async updateFile(
    @Param('fileId') fileId: string,
    @Body() body: Prisma.FileUpdateInput
  ): Promise<File> {
    return await this.fileService.update({
      where: {id: fileId},
      data: body,
    });
  }

  @Delete(':fileId')
  @ApiParam({
    name: 'fileId',
    schema: {type: 'string'},
    description: 'The uuid of the file.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async deleteFile(@Param('fileId') fileId: string): Promise<File> {
    return await this.fileService.delete({where: {id: fileId}});
  }

  /* End */
}
