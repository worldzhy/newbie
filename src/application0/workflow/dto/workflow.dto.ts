import {ApiProperty} from '@nestjs/swagger';
import {IsNumber, IsNotEmpty, IsString, IsOptional} from 'class-validator';
import {Type} from 'class-transformer';

// common
export class PaginationResDto {
  @ApiProperty({
    type: Number,
  })
  countOfCurrentPage: number;

  @ApiProperty({
    type: Number,
  })
  countOfTotal: number;

  @ApiProperty({
    type: Number,
  })
  page: number;

  @ApiProperty({
    type: Number,
  })
  pageSize: number;
}

export class WorkflowCreateReqDto {
  @ApiProperty({
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class WorkflowUpdateReqDto {
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
  })
  @IsString()
  @IsOptional()
  description?: string;
}

export class WorkflowDetailResDto {
  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty({
    type: String,
  })
  name: string;

  @ApiProperty({
    type: String,
  })
  description: string | null;

  @ApiProperty({
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    type: Date,
  })
  updatedAt: Date;
}

export class WorkflowListReqDto {
  @ApiProperty({
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  // query参数实际都是字符串，这里需要转换下number
  @Type(() => Number)
  pageSize: number;

  @ApiProperty({
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  page: number;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;
}

export class WorkflowListResDto {
  @ApiProperty({
    type: WorkflowDetailResDto,
    isArray: true,
  })
  records: WorkflowDetailResDto[];

  @ApiProperty({
    type: PaginationResDto,
  })
  pagination: PaginationResDto;
}
