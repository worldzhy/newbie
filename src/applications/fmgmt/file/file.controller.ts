import {
  Body,
  Controller,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {Express} from 'express';
import {diskStorage} from 'multer';

@ApiTags('[Application] File Management / File')
@ApiBearerAuth()
@Controller('file')
export class FileController {
  @Post()
  @UseInterceptors(
    FileInterceptor('files', {
      storage: diskStorage({
        destination: './uploadedFiles/avatars',
      }),
    })
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {file: file.buffer.toString()};
  }

  @Post('pass-validation')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploadedFiles/avatars',
      }),
    })
  )
  uploadFileAndPassValidation(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'json',
        })
        .build({
          fileIsRequired: false,
        })
    )
    file?: Express.Multer.File
  ) {
    return {file: file?.buffer.toString()};
  }

  @Post('fail-validation')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploadedFiles/avatars',
      }),
    })
  )
  uploadFileAndFailValidation(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'jpg',
        })
        .build()
    )
    file: Express.Multer.File
  ) {
    return {file: file.buffer.toString()};
  }
}
