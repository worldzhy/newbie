import {ApiProperty} from '@nestjs/swagger';
import {IsNumber, IsNotEmpty, IsString, IsOptional} from 'class-validator';
import {Type} from 'class-transformer';
import {NotificationWebhookChannelCreateReqDto} from '@microservices/notification/webhook/webhook.dto';
import {NotificationWebhookRecordStatus} from '@microservices/notification/webhook/constants';

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

export class NotificationWebhookChannelListReqDto extends CommonPage {
  @ApiProperty({
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  accessKeyId: number;
}

export class NotificationWebhookRecordListReqDto extends CommonPage {
  @ApiProperty({
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  channelId: number;
}

export class NotificationWebhookChannelDetailResDto extends NotificationWebhookChannelCreateReqDto {
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

export class NotificationWebhookChannelListResDto {
  @ApiProperty({
    type: NotificationWebhookChannelDetailResDto,
    isArray: true,
  })
  records: NotificationWebhookChannelDetailResDto[];

  @ApiProperty({
    type: PaginationResDto,
  })
  pagination: PaginationResDto;
}

export class NotificationWebhookRecordDetailResDto {
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
    enum: NotificationWebhookRecordStatus,
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

export class NotificationWebhookRecordListResDto {
  @ApiProperty({
    type: NotificationWebhookRecordDetailResDto,
    isArray: true,
  })
  records: NotificationWebhookRecordDetailResDto[];

  @ApiProperty({
    type: PaginationResDto,
  })
  pagination: PaginationResDto;
}
