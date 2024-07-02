import {ApiProperty} from '@nestjs/swagger';
import {IsNumber, IsNotEmpty, IsString, IsOptional} from 'class-validator';
import {Type} from 'class-transformer';
import {
  CommonPaginationReqDto,
  CommonPaginationResDto,
} from '@framework/common.dto';
import {NotificationWebhookChannelCreateReqDto} from '@microservices/notification/webhook/webhook.dto';
import {
  NotificationWebhookRecordStatus,
  NotificationWebhookPlatform,
} from '@microservices/notification/webhook/constants';

export class NotificationAccessKeyListReqDto extends CommonPaginationReqDto {
  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  id?: number;
}

export class NotificationWebhookChannelListReqDto extends CommonPaginationReqDto {
  @ApiProperty({
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  accessKeyId: number;

  @ApiProperty({
    type: String,
    enum: NotificationWebhookPlatform,
  })
  @IsString()
  platform: string;
}

export class NotificationWebhookRecordListReqDto extends CommonPaginationReqDto {
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
    type: CommonPaginationResDto,
  })
  pagination: CommonPaginationResDto;
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
    type: CommonPaginationResDto,
  })
  pagination: CommonPaginationResDto;
}
