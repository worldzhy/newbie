import {ApiProperty} from '@nestjs/swagger';
import {IsNumber, IsOptional} from 'class-validator';
import {CommonPaginationReqDto, CommonPaginationResDto} from '@/dto/common';
import {Type} from 'class-transformer';

export class GoClickGroupDetailResDto {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty({
    type: String,
  })
  name: string;

  @ApiProperty({
    type: Number,
  })
  sort: number;

  @ApiProperty({
    type: Number,
  })
  parentId: number;

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

export class GoClickGroupListReqDto extends CommonPaginationReqDto {
  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  id?: number;
}

export class GoClickGroupListResDto {
  @ApiProperty({
    type: GoClickGroupDetailResDto,
    isArray: true,
  })
  records: GoClickGroupDetailResDto[];

  @ApiProperty({
    type: CommonPaginationResDto,
  })
  pagination: CommonPaginationResDto;
}

export class GoClickLinkDetailResDto {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty({
    type: Number,
  })
  groupId: number;

  @ApiProperty({
    type: String,
  })
  name: string;

  @ApiProperty({
    type: String,
  })
  url: string;

  @ApiProperty({
    type: Number,
  })
  sort: number;

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

export class GoClickLinkListReqDto extends CommonPaginationReqDto {
  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  id?: number;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  groupId?: number;
}

export class GoClickLinkListResDto {
  @ApiProperty({
    type: GoClickLinkDetailResDto,
    isArray: true,
  })
  records: GoClickLinkDetailResDto[];

  @ApiProperty({
    type: CommonPaginationResDto,
  })
  pagination: CommonPaginationResDto;
}
