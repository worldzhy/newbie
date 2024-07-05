import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsOptional, IsArray, IsBoolean} from 'class-validator';

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
  // @ApiProperty({
  //   type: Boolean,
  //   required: false,
  // })
  // @IsBoolean()
  // @IsOptional()
  // findPhone?: boolean;
  // @ApiProperty({
  //   type: Boolean,
  //   required: false,
  // })
  // @IsBoolean()
  // @IsOptional()
  // findEmail?: boolean;
}

export class CreateContactSearchTaskBatchReqDto {
  @ApiProperty({
    type: ContactSearchPeopleTaskDto,
    isArray: true,
  })
  @IsArray()
  peoples: ContactSearchPeopleTaskDto[];

  @ApiProperty({
    type: Boolean,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  findPhone?: boolean;

  @ApiProperty({
    type: Boolean,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  findEmail?: boolean;

  @ApiProperty({
    type: String,
  })
  @IsString()
  batchId: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  callbackUrl?: string;
}
