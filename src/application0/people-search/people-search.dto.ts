import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsArray, IsOptional} from 'class-validator';
import {PeopleSearchPlatforms} from './constants';

export class ContactSearchPeopleDto {
  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  userSource?: string;

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
  firstName?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  middleName?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  companyDomain?: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  linkedin?: string;
}
export class ContactSearchReqDto {
  @ApiProperty({
    type: String,
    enum: PeopleSearchPlatforms,
  })
  @IsArray()
  @IsString({each: true})
  platforms: string;

  @ApiProperty({
    type: ContactSearchPeopleDto,
    isArray: true,
  })
  @IsArray()
  peoples: ContactSearchPeopleDto[];
}