import {Express} from 'express';
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
import {AvailabilityService} from './availability.service';

@ApiTags('Availability')
@ApiBearerAuth()
@Controller('availability')
export class AvailabilityUploadController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post('upload-file')
  @ApiBody({
    description: '',
    examples: {a: {value: {year: 2023, quarter: 4}}},
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
    @Body() body: {year: string; quarter: string}
  ) {
    await this.availabilityService.parseXLSXFile(file, {
      year: parseInt(body.year),
      quarter: parseInt(body.quarter),
    });
  }

  @Post('fetch-google-form')
  @ApiBody({
    description: '',
    examples: {a: {value: {year: 2023, quarter: 4}}},
  })
  async fetchGoogleForm(@Body() body: {year: string; quarter: string}) {
    await this.availabilityService.fetchGoogleForm({
      year: parseInt(body.year),
      quarter: parseInt(body.quarter),
    });
  }

  // End
}