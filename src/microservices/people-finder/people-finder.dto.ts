import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsOptional} from 'class-validator';

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
export class ContactSearchPeopleDto extends ContactSearchPeopleBase {
  taskId: string;
}
