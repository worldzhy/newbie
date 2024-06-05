import {ApiProperty} from '@nestjs/swagger';
import {IsObject, IsString, ValidateNested, IsDefined} from 'class-validator';
import {Type} from 'class-transformer';
import {FeishuWebhookMessageType} from './constants';

export class FeishuWebhookPostResDto {
  @ApiProperty({
    type: Number,
  })
  code: number;

  @ApiProperty({
    type: String,
  })
  msg: string;

  @ApiProperty({
    type: Number,
  })
  data: unknown;
}

export class FeishuWebhookPostBodyDto {
  @ApiProperty({
    type: String,
    enum: FeishuWebhookMessageType,
  })
  @IsString()
  msg_type: string;

  @ApiProperty({
    type: Object,
  })
  @IsObject()
  content: object;
}

export class NotificationFeishuWebhookReqDto {
  @ApiProperty({
    type: String,
  })
  @IsString()
  channelName: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  accessKey: string;

  @ApiProperty({
    type: FeishuWebhookPostBodyDto,
  })
  @Type(() => FeishuWebhookPostBodyDto)
  @ValidateNested()
  @IsDefined()
  feishuParams: FeishuWebhookPostBodyDto;
}

export class NotificationFeishuWebhookResDto {
  @ApiProperty({
    type: Object,
    required: false,
  })
  res?: object;

  @ApiProperty({
    type: Object,
    required: false,
  })
  error?: object;
}
