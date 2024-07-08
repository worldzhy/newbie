import {ApiProperty} from '@nestjs/swagger';
import {IsString} from 'class-validator';

class CommonResDto {
  error?: unknown;
  res?: unknown;
}
class CommonErrorResDto {
  error: any;
}
export enum ErrorStatus {
  INSUFFICIENT_CREDITS = 403,
}
export class SearchPeopleLinkedinReqDto {
  @ApiProperty({
    type: String,
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  companyDomain: string;

  @ApiProperty({
    type: String,
    required: false,
  })
  @IsString()
  lastName?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'Name of country, city or state',
  })
  @IsString()
  /** Name of country, city or state */
  location?: string;
}

export class SearchPeopleLinkedinRes {
  url: string;
  company_similarity_score: number;
  location_similarity_score: number;
  name_similarity_score: number;
  title_similarity_score: number;
}
export class SearchPeopleLinkedinResDto implements CommonResDto {
  error?: CommonErrorResDto;
  res?: SearchPeopleLinkedinRes;
  spent: number;
}

export class SearchPeopleByLinkedinReqDto {
  linkedinUrl: string;
  /**
   * default value: exclude
   * Costs an extra `1` credit per email returned on top of the cost of the base endpoint (if data is available).
   */
  personalEmail?: 'exclude' | 'include';
  /**
   * default value: exclude
   * Costs an extra `1` credit per number returned on top of the cost of the base endpoint (if data is available).
   */
  personalContactNumber?: 'exclude' | 'include';
}

export class SearchPeopleByLinkedinRes {
  personal_emails: string[];
  personal_numbers: string[];

  public_identifier?: string;
  profile_pic_url?: string;
  background_cover_image_url?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  occupation?: string;
  headline?: string;
  summary?: string;
  country?: string;
  country_full_name?: string;
  city?: string;
  state?: string;
  experiences?: unknown[];
  education?: unknown[];
  languages?: string[];
  accomplishment_organisations?: unknown[];
  accomplishment_publications?: unknown[];
  accomplishment_honors_awards?: unknown[];
  accomplishment_patents?: unknown[];
  accomplishment_courses?: unknown[];
  accomplishment_projects?: unknown[];
  accomplishment_test_scores?: unknown[];
  volunteer_work?: unknown[];
  certifications?: unknown[];
  connections?: number;
  people_also_viewed?: unknown[];
  recommendations?: string[];
  activities?: unknown[];
  similarly_named_profiles?: unknown[];
  articles?: unknown[];
  groups?: unknown[];
  skills?: string[];
  inferred_salary?: unknown;
  gender?: string;
  birth_date?: unknown;
  industry?: string;
  interests?: string[];
  extra?: unknown;
}

export class SearchPeopleByLinkedinResDto implements CommonResDto {
  error?: CommonErrorResDto;
  res?: SearchPeopleByLinkedinRes;
  spent: number;
}
