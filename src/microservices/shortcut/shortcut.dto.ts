import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsNumber, IsOptional} from 'class-validator';

export class ShortcutReqBaseDto {
  channelName: string;
}

export class ShortcutGroupCreateReqDto {
  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  parentId: number;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  sort: number;

  @ApiProperty({
    type: String,
  })
  @IsString()
  name: string;
}

export class ShortcutGroupUpdateReqDto {
  @ApiProperty({
    type: Number,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  parentId: number;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  sort: number;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  name: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  status: string;
}

export class ShortcutItemCreateReqDto {
  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  groupId: number;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  sort: number;

  @ApiProperty({
    type: String,
  })
  @IsString()
  label: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  content: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  type: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  description: string;
}

export class ShortcutItemUpdateReqDto {
  @ApiProperty({
    type: Number,
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  groupId: number;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  sort: number;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  label: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  content: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  type: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  status: string;
}
