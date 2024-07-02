import {ApiProperty} from '@nestjs/swagger';
import {IsNumber, IsOptional} from 'class-validator';
import {
  CommonPaginationReqDto,
  CommonPaginationResDto,
} from '@framework/common.dto';
import {Type} from 'class-transformer';

export class NotificationAccessKeyDetailResDto {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: String,
  })
  key: string;

  @ApiProperty({
    type: String,
  })
  name: string;

  @ApiProperty({
    type: String,
  })
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

export class NotificationAccessKeyListResDto {
  @ApiProperty({
    type: NotificationAccessKeyDetailResDto,
    isArray: true,
  })
  records: NotificationAccessKeyDetailResDto[];

  @ApiProperty({
    type: CommonPaginationResDto,
  })
  pagination: CommonPaginationResDto;
}
