import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsOptional} from 'class-validator';
import {CommonPaginationReqDto, CommonPaginationResDto} from '@/dto/common';

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

export class WorkflowListReqDto extends CommonPaginationReqDto {
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
    type: CommonPaginationResDto,
  })
  pagination: CommonPaginationResDto;
}
