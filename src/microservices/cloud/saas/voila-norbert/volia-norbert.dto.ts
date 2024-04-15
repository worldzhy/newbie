import {ApiProperty} from '@nestjs/swagger';
import {IsNumber, IsNotEmpty, IsString, IsOptional} from 'class-validator';

export class SearchNameReqDto {
  @ApiProperty({
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  company: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  domain: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  @IsOptional()
  webhook?: string;

  @ApiProperty({
    type: Number,
    required: false,
  })
  @IsString()
  @IsOptional()
  list_id?: number;
}

export class EmailDto {
  email: string;
  /**
   * 100 : We found the email and checked it against the mail server and it appears to be valid
     80 : We found the email but we were unable to validate it against the mail server.
     5 : We found the email using outside services but we can’t verify its validity.
   */
  score: number;
}

export class SearchNameResDto {
  @ApiProperty({
    type: EmailDto,
    description:
      'When searching, this data is set to null. Once the search is done, if we found the corresponding email, the email becomes an object containing information including the email value and the score related to this email.',
  })
  email: string | null;

  @ApiProperty({
    type: String,
  })
  name: string;

  @ApiProperty({
    type: Boolean,
    description:
      'The searching boolean returned by the server will let you know if the server is searching for that contact of it has already been found',
  })
  searching: boolean;
}

export class SearchNameHttpResDto {
  status: 200 | 400;
  data: SearchNameResDto;
}
