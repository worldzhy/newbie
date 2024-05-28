import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsOptional, IsArray} from 'class-validator';

export class ContactSearchPeopleBase {
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
export class PeopleFinderCallThirdPartyDto extends ContactSearchPeopleBase {}

export class ContactSearchPeopleTaskDto extends ContactSearchPeopleBase {
  @ApiProperty({
    type: Boolean,
    required: false,
  })
  @IsString()
  @IsOptional()
  findPhone?: boolean;

  @ApiProperty({
    type: Boolean,
    required: false,
  })
  @IsString()
  @IsOptional()
  findEmail?: boolean;
}

export class CreateContactSearchTaskBranchReqDto {
  @ApiProperty({
    type: ContactSearchPeopleTaskDto,
    isArray: true,
  })
  @IsArray()
  peoples: ContactSearchPeopleTaskDto[];

  @ApiProperty({
    type: String,
  })
  @IsString()
  branchId: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  callbackUrl?: string;
}
