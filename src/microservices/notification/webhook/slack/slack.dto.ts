import {ApiProperty} from '@nestjs/swagger';
import {
  IsObject,
  IsString,
  ValidateNested,
  IsDefined,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import {Type} from 'class-transformer';
import {SlackWebhookMessageType} from './constants';

export type SlackWebhookPostResDto = string;
export class SlackWebhookPostBodyDto {
  @ApiProperty({
    type: String,
  })
  @IsString()
  [SlackWebhookMessageType.Text]: string;

  @ApiProperty({
    type: Object,
    isArray: true,
    required: false,
  })
  @IsObject()
  @IsOptional()
  [SlackWebhookMessageType.Blocks]?: object[];

  @ApiProperty({
    type: Object,
    isArray: true,
    required: false,
  })
  @IsObject()
  @IsOptional()
  [SlackWebhookMessageType.Attachments]?: object[];

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  [SlackWebhookMessageType.Thread_ts]?: string;

  @ApiProperty({
    type: Boolean,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  [SlackWebhookMessageType.Mrkdwn]?: boolean;
}

export class NotificationSlackWebhookReqDto {
  @ApiProperty({
    type: String,
  })
  @IsString()
  channelName: string;

  @ApiProperty({
    type: SlackWebhookPostBodyDto,
  })
  @Type(() => SlackWebhookPostBodyDto)
  @ValidateNested()
  @IsDefined()
  body: SlackWebhookPostBodyDto;
}

export class NotificationSlackWebhookResDto {
  @ApiProperty({
    type: String,
    required: false,
  })
  res?: string;

  @ApiProperty({
    type: Object,
    required: false,
  })
  error?: object;
}
