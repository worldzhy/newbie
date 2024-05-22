import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsNumber, IsOptional} from 'class-validator';
import {
  ThirdNotificationPlatform,
  ThirdNotificationChannelStatus,
  ThirdNotificationAccountStatus,
} from './constants';

export class ThirdNotificationAccountCreateReqDto {
  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  remark?: string;
}

export class ThirdNotificationAccountUpdateReqDto extends ThirdNotificationAccountCreateReqDto {
  @ApiProperty({
    type: Number,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    type: String,
    required: false,
    enum: ThirdNotificationAccountStatus,
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
export class ThirdNotificationReqBaseDto {
  channelName: string;
}

export class ThirdNotificationChannelCreateReqDto {
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
  url: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  desc?: string;

  @ApiProperty({
    type: String,
    enum: ThirdNotificationPlatform,
  })
  @IsString()
  platform: string;
}

export class ThirdNotificationChannelUpdateReqDto {
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
  url?: string;

  @ApiProperty({
    type: String,
    required: false,
    enum: ThirdNotificationChannelStatus,
  })
  @IsString()
  @IsOptional()
  status?: string;
}
