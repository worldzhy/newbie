import {ApiProperty} from '@nestjs/swagger';
import {IsNumber, IsNotEmpty, IsString, IsOptional} from 'class-validator';
import {Type} from 'class-transformer';
import {ThirdNotificationChannelCreateReqDto} from '@microservices/third-notification/third-notification.dto';
import {ThirdNotificationRecordStatus} from '@microservices/third-notification/constants';

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

export class ThirdNotificationCreateReqDto {
  @ApiProperty({
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class ThirdNotificationUpdateReqDto {
  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class ThirdNotificationAccountDetailResDto {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: String,
  })
  accessKey: string;

  @ApiProperty({
    type: String,
  })
  remark: string;

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
  // query参数实际都是字符串，这里需要转换下number
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

export class ThirdNotificationAccountListReqDto extends CommonPage {
  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  id?: number;
}

export class ThirdNotificationChannelListReqDto extends CommonPage {
  @ApiProperty({
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  accountId: number;
}

export class ThirdNotificationRecordListReqDto extends CommonPage {
  @ApiProperty({
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  channelId: number;
}

export class ThirdNotificationAccountListResDto {
  @ApiProperty({
    type: ThirdNotificationAccountDetailResDto,
    isArray: true,
  })
  records: ThirdNotificationAccountDetailResDto[];

  @ApiProperty({
    type: PaginationResDto,
  })
  pagination: PaginationResDto;
}

export class ThirdNotificationChannelDetailResDto extends ThirdNotificationChannelCreateReqDto {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
  })
  updatedAt: Date;
}

export class ThirdNotificationChannelListResDto {
  @ApiProperty({
    type: ThirdNotificationChannelDetailResDto,
    isArray: true,
  })
  records: ThirdNotificationChannelDetailResDto[];

  @ApiProperty({
    type: PaginationResDto,
  })
  pagination: PaginationResDto;
}

export class ThirdNotificationRecordDetailResDto {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: Number,
  })
  @IsNumber()
  channelId: number;

  @ApiProperty({
    type: String,
  })
  @IsString()
  reqContext: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  resContext: string;

  @ApiProperty({
    type: String,
    enum: ThirdNotificationRecordStatus,
  })
  @IsString()
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

export class ThirdNotificationRecordListResDto {
  @ApiProperty({
    type: ThirdNotificationRecordDetailResDto,
    isArray: true,
  })
  records: ThirdNotificationRecordDetailResDto[];

  @ApiProperty({
    type: PaginationResDto,
  })
  pagination: PaginationResDto;
}
