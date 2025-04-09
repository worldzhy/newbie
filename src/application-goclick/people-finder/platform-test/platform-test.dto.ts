import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsArray} from 'class-validator';

export class CreateContactSearchBatchResDto {
  @ApiProperty({
    type: String,
  })
  @IsString()
  batchId: string;
}

export class GetContactSearchBatchReqDto {
  @ApiProperty({
    type: String,
  })
  @IsString()
  batchId: string;
}

export class GetContactSearchBatchListReqDto {
  @ApiProperty({
    type: String,
    isArray: true,
  })
  @IsArray()
  batchIds: string[];
}

export class GetBatchStatusResDto {
  @ApiProperty({
    type: Boolean,
  })
  completed: boolean;

  @ApiProperty({
    type: Number,
  })
  totalCompleted: number;

  @ApiProperty({
    type: Number,
  })
  total: number;
}

export class GetBatchListStatusResDto {
  [key: string]: GetBatchStatusResDto;
}
