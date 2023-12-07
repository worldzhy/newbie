import {
  Body,
  Controller,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {ApiBearerAuth, ApiBody, ApiTags} from '@nestjs/swagger';
import {FileInterceptor} from '@nestjs/platform-express';
import {Express} from 'express';
import {AvailabilityService} from './availability.service';

enum QUARTER {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4',
}

@ApiTags('Availability')
@ApiBearerAuth()
@Controller('availability')
export class AvailabilityUploadController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post('upload-file')
  @ApiBody({
    description: '',
    examples: {a: {value: {year: 2023, quarter: 'Q4'}}},
  })
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
    file: Express.Multer.File,
    @Body() body: {year: string; quarter: QUARTER}
  ) {
    await this.availabilityService.parseXLSXFile({
      year: parseInt(body.year),
      quarter: body.quarter,
      file,
    });
  }

  @Post('fetch-google-form')
  async fetchGoogleForm() {
    await this.availabilityService.fetchGoogleForm();
  }

  // End
}
