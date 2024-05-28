import {ApiProperty} from '@nestjs/swagger';
import {IsObject, IsString} from 'class-validator';
import {Type} from 'class-transformer';
import {FeishuNotificationMsgType} from './constants';

export class FeishuPostResDto {
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

export class FeishuPostBodyDto {
  @ApiProperty({
    type: String,
    enum: FeishuNotificationMsgType,
  })
  @IsString()
  msg_type: string;

  @ApiProperty({
    type: Object,
  })
  @IsObject()
  content: any;
}

export class FeishuNotificationReqDto {
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
    type: FeishuPostBodyDto,
  })
  @Type(() => FeishuPostBodyDto)
  feishuParams: FeishuPostBodyDto;
}
