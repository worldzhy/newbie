import {
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
import {getFileManagementConfig} from '../../_config/_fmgmt.config';

@ApiTags('[Application] File Management')
@ApiBearerAuth()
@Controller('file-management')
export class FileManagementController {
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('files', {
      storage: diskStorage({
        destination: getFileManagementConfig().server_path,
      }),
    })
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {file: file.buffer.toString()};
  }

  @Post('upload-pass-validation')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: getFileManagementConfig().server_path,
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

  @Post('upload-fail-validation')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: getFileManagementConfig().server_path,
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
