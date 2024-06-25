import {ApiProperty} from '@nestjs/swagger';
import {IsNumber, IsOptional} from 'class-validator';
import {CommonPaginationReqDto, CommonPaginationResDto} from '@/dto/common';
import {Type} from 'class-transformer';

export class ShortcutGroupDetailResDto {
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

export class ShortcutGroupListReqDto extends CommonPaginationReqDto {
  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  id?: number;
}

export class ShortcutGroupListResDto {
  @ApiProperty({
    type: ShortcutGroupDetailResDto,
    isArray: true,
  })
  records: ShortcutGroupDetailResDto[];

  @ApiProperty({
    type: CommonPaginationResDto,
  })
  pagination: CommonPaginationResDto;
}

export class ShortcutItemDetailResDto {
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
  label: string;

  @ApiProperty({
    type: String,
  })
  content: string;

  @ApiProperty({
    type: String,
  })
  type: string;

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

export class ShortcutItemListReqDto extends CommonPaginationReqDto {
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

export class ShortcutItemListResDto {
  @ApiProperty({
    type: ShortcutItemDetailResDto,
    isArray: true,
  })
  records: ShortcutItemDetailResDto[];

  @ApiProperty({
    type: CommonPaginationResDto,
  })
  pagination: CommonPaginationResDto;
}

export class ShortcutTreeResDto extends ShortcutGroupDetailResDto {
  @ApiProperty({
    type: ShortcutItemDetailResDto,
    isArray: true,
  })
  child: ShortcutItemDetailResDto[];

  @ApiProperty({
    type: ShortcutItemDetailResDto,
    isArray: true,
  })
  items: ShortcutItemDetailResDto[];
}
