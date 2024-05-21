import {ApiProperty} from '@nestjs/swagger';
import {IsString} from 'class-validator';
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

  content: any;
}

export class FeishuNotificationReqDto extends FeishuPostBodyDto {
  channelName: string;
}
