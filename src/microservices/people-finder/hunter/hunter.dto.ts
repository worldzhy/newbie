import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsOptional} from 'class-validator';

// export enum HunterStatus {
//   SUCCESS = 200,
//   INVALID_REQUEST_ERROR = 400,
//   INSUFFICIENT_CREDITS = 402,
// }

class CommonResDto {
  error?: unknown;
  res?: unknown;
}

class CommonErrorResDto {
  error: unknown;
}

export class PersonMatchReqDto {
  @ApiProperty({
    type: String,
    required: false,
    description: 'LinkedIn',
  })
  @IsString()
  @IsOptional()
  social_url?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'domain',
  })
  @IsString()
  @IsOptional()
  domain?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'lastName',
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'firstName',
  })
  @IsString()
  @IsOptional()
  firstName?: string;
}

export class PersonMatchContentResDto {
  @ApiProperty({
    type: String,
  })
  email: string;
}

interface HunterParams {
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  domain: string | null;
  company: string | null;
  max_duration: number | null;
}

export class PersonMatchThirdRes {
  data: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
    score: number | null;
    domain: string | null;
    accept_all: boolean | null;
    position: string | null;
    twitter: string | null;
    linkedin_url: string | null;
    phone_number: string | null;
    company: string | null;
    sources: string[];
    verification: {
      date: string | null;
      status: string | null;
    };
  };
  meta: {
    params: HunterParams;
  };
}
export class PersonMatchThirdResDto {
  status: number;
  data: PersonMatchThirdRes;
  [x: string]: unknown;
}

export class PersonMatchResDto implements CommonResDto {
  error?: CommonErrorResDto;
  res?: PersonMatchThirdRes['data'];
  noCredits?: boolean;
}
