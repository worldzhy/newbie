import {ApiProperty} from '@nestjs/swagger';
import {IsString} from 'class-validator';

class CommonResDto {
  error?: unknown;
  res?: unknown;
}
class CommonErrorResDto {
  error: unknown;
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
  domain: string;

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
  personalEmails: string[];
  personalNumbers: string[];

  publicIdentifier?: string;
  profilePicUrl?: string;
  backgroundCoverImageUrl?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  occupation?: string;
  headline?: string;
  summary?: string;
  country?: string;
  countryFullName?: string;
  city?: string;
  state?: string;
  experiences?: unknown[];
  education?: unknown[];
  languages?: string[];
  accomplishmentOrganisations?: unknown[];
  accomplishmentPublications?: unknown[];
  accomplishmentHonorsAwards?: unknown[];
  accomplishmentPatents?: unknown[];
  accomplishmentCourses?: unknown[];
  accomplishmentProjects?: unknown[];
  accomplishmentTestScores?: unknown[];
  volunteerWork?: unknown[];
  certifications?: unknown[];
  connections?: number;
  peopleAlsoViewed?: unknown[];
  recommendations?: string[];
  activities?: unknown[];
  similarlyNamedProfiles?: unknown[];
  articles?: unknown[];
  groups?: unknown[];
  skills?: string[];
  inferredSalary?: unknown;
  gender?: string;
  birthDate?: unknown;
  industry?: string;
  interests?: string[];
  extra?: unknown;
}

export class SearchPeopleByLinkedinResDto implements CommonResDto {
  error?: CommonErrorResDto;
  res?: SearchPeopleByLinkedinRes;
}
