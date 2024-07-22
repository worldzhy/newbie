import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsOptional} from 'class-validator';

export enum VoliaNorbertStatus {
  SUCCESS = 200,
  INVALID_REQUEST_ERROR = 400,
  INSUFFICIENT_CREDITS = 402,
}
class CommonResDto {
  error?: unknown;
  res?: unknown;
}
class CommonErrorResDto {
  error: unknown;
}

export class SearchEmailByDomainReqDto {
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
  company?: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  companyDomain: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  webhook: string;

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

export class SearchEmailContentResDto {
  @ApiProperty({
    type: EmailDto,
    description:
      'When searching, this data is set to null. Once the search is done, if we found the corresponding email, the email becomes an object containing information including the email value and the score related to this email.',
  })
  email: EmailDto | null;

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

  company: {
    name: string;
    title: string;
    url: string;
  };
  created: number;
  id: number;
  is_new: boolean;
  lists: unknown[]; // Adjust the type accordingly
  status: string;
}

export class SearchEmailThirdResDto {
  status: VoliaNorbertStatus;
  data: SearchEmailContentResDto;
  // [request, header, config]
  [x: string]: unknown;
}

export class SearchEmailResDto implements CommonResDto {
  error?: CommonErrorResDto;
  res?: SearchEmailContentResDto;
  noCredits?: boolean;
}
