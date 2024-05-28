import {ApiProperty} from '@nestjs/swagger';
import {IsString} from 'class-validator';

export class CreateContactSearchBranchResDto {
  @ApiProperty({
    type: String,
  })
  @IsString()
  branchId: string;
}

export class GetContactSearchBranchReqDto {
  @ApiProperty({
    type: String,
  })
  @IsString()
  branchId: string;
}

export class GetBranchStatusResDto {
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
