import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsNumber, IsOptional} from 'class-validator';
import {NotificationWebhookPlatform} from './constants';

export class NotificationWebhookReqBaseDto {
  channelName: string;
}

export class NotificationWebhookChannelCreateReqDto {
  @ApiProperty({
    type: Number,
  })
  @IsNumber()
  accessKeyId: number;

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
  description?: string;

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
  description?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  webhook?: string;
}
