import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsNumber, IsOptional} from 'class-validator';
import {NotificationAccessKeyStatus} from './constants';

export class NotificationAccessKeyCreateReqDto {
  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
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
    enum: NotificationAccessKeyStatus,
  })
  @IsString()
  @IsOptional()
  status?: string;
}
