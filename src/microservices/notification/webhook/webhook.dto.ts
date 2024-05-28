import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsNumber, IsOptional} from 'class-validator';
import {
  NotificationWebhookPlatform,
  NotificationAccessStatus,
} from './constants';

export class NotificationAccessKeyCreateReqDto {
  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  remark?: string;
}

export class NotificationAccessKeyUpdateReqDto extends NotificationAccessKeyCreateReqDto {
  @ApiProperty({
    type: Number,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    type: String,
    required: false,
    enum: NotificationAccessStatus,
  })
  @IsString()
  @IsOptional()
  status?: string;
}
// @ApiProperty({
//   type: String,
// })
// @IsString()
// accessKey: string;
export class NotificationWebhookReqBaseDto {
  channelName: string;
}

export class NotificationWebhookChannelCreateReqDto {
  @ApiProperty({
    type: Number,
  })
  @IsNumber()
  accountId: number;

  @ApiProperty({
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  webhook: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  desc?: string;

  @ApiProperty({
    type: String,
    enum: NotificationWebhookPlatform,
  })
  @IsString()
  platform: string;
}

export class NotificationWebhookChannelUpdateReqDto {
  @ApiProperty({
    type: Number,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  desc?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  webhook?: string;
}
