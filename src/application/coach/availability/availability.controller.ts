import {
  Controller,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
} from '@nestjs/common';
import {ApiBearerAuth, ApiTags} from '@nestjs/swagger';
import {XLSXService} from '@toolkit/xlsx/xlsx.service';
import {Express} from 'express';

@ApiTags('Availability')
@ApiBearerAuth()
@Controller('availability')
export class AvailabilityController {
  @Post('load')
  async loadAvailabilityFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({fileType: 'xlsx'})
        .build()
    )
    file: Express.Multer.File
  ) {
    const xlsx = new XLSXService();
    xlsx.loadFile(file);

    const sheets = xlsx.getSheets();
    for (let i = 0; i < sheets.length; i++) {
      const sheet = sheets[i];
      const columns = xlsx.getColumns(sheet);
      console.log(columns);
      const dataArr = xlsx.getDataRows(sheet);
      console.log(dataArr);
    }
  }

  @Post('publish')
  async publishAvailabilityExpressions() {}
}
