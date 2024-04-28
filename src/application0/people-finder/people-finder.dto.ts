import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsArray, IsOptional} from 'class-validator';
import {PeopleFinderPlatforms} from '@microservices/people-finder/constants';

export class ContactSearchPeopleDto {
  @ApiProperty({
    type: String,
  })
  @IsString()
  userId: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  userSource: string;

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
    enum: PeopleFinderPlatforms,
  })
  @IsArray()
  @IsString({each: true})
  platforms: PeopleFinderPlatforms[];

  @ApiProperty({
    type: ContactSearchPeopleDto,
    isArray: true,
  })
  @IsArray()
  peoples: ContactSearchPeopleDto[];
}
