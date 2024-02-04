import {
  Controller,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {FileInterceptor} from '@nestjs/platform-express';
import {Express} from 'express';
import {XLSXService} from '@toolkit/xlsx/xlsx.service';

enum Column {
  Email = 'Email Addresss',
  Name = 'Full Name',
}

@ApiTags('File Management')
@ApiBearerAuth()
@Controller('file-mgmt/local')
export class LocalDriveController {
  constructor() {}

  @Post('import-sheet')
  @UseInterceptors(FileInterceptor('file'))
  async loadAvailabilityFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType:
            'text/csv|application/vnd.ms-excel|application/msexcel|application/xls|application/x-xls|application/x-excel|application/x-dos_ms_excel|application/x-ms-excel|application/x-msexcel|application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
        .build()
    )
    file: Express.Multer.File
  ) {
    const xlsx = new XLSXService();

    xlsx.loadFile(file);

    const sheets = xlsx.getSheets();

    const sheet = sheets[0];

    const rows = xlsx.getDataRows(sheet);
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      console.log(row[Column.Name] + "'s email is " + row[Column.Email]);
    }
  }

  // End
}
