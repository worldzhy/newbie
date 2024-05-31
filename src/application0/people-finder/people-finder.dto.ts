import {ApiProperty} from '@nestjs/swagger';
import {IsString} from 'class-validator';

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
