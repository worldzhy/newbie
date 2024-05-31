import {ApiProperty} from '@nestjs/swagger';
import {IsNumber, IsNotEmpty, IsOptional} from 'class-validator';
import {Type} from 'class-transformer';

// common
export class PaginationResDto {
  @ApiProperty({
    type: Number,
  })
  countOfCurrentPage: number;

  @ApiProperty({
    type: Number,
  })
  countOfTotal: number;

  @ApiProperty({
    type: Number,
  })
  page: number;

  @ApiProperty({
    type: Number,
  })
  pageSize: number;
}

export class NotificationAccessKeyDetailResDto {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: String,
  })
  key: string;

  @ApiProperty({
    type: String,
  })
  name: string;

  @ApiProperty({
    type: String,
  })
  status: string;

  @ApiProperty({
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
  })
  updatedAt: Date;
}

export class CommonPage {
  @ApiProperty({
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  pageSize: number;

  @ApiProperty({
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  page: number;
}

export class NotificationAccessKeyListReqDto extends CommonPage {
  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  id?: number;
}

export class NotificationAccessKeyListResDto {
  @ApiProperty({
    type: NotificationAccessKeyDetailResDto,
    isArray: true,
  })
  records: NotificationAccessKeyDetailResDto[];

  @ApiProperty({
    type: PaginationResDto,
  })
  pagination: PaginationResDto;
}
