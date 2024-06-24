import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsNumber, IsOptional} from 'class-validator';
import {NotificationAccessKeyStatus} from './constants';

export class NotificationAccessKeyCreateReqDto {
  @ApiProperty({
    type: String,
  })
  @IsString()
  name: string;
}

export class NotificationAccessKeyUpdateReqDto {
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
  name?: string;

  @ApiProperty({
    type: String,
    required: false,
    enum: NotificationAccessKeyStatus,
  })
  @IsString()
  @IsOptional()
  status?: string;
}