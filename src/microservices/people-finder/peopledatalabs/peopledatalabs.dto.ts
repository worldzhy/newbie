import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsBoolean} from 'class-validator';

export enum PeopledatalabsStatus {
  SUCCESS = 200,
  INVALID_REQUEST_ERROR = 400,
  AUTHENTICATION_ERROR = 401,
  PAYMENT_REQUIRED = 402,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  RATE_LIMIT_ERROR = 429,
  API_ERROR = 500,
}

class CommonResDto {
  error?: unknown;
  res?: unknown;
}
class CommonErrorResDto {
  error: any;
  ctx?: SearchPeopleThirdResDto | SearchPeopleThirdResDto[];
}
export class SearchPeopleByDomainReqDto {
  @ApiProperty({
    type: String,
  })
  @IsString()
  name: string;

  @ApiProperty({
    type: String,
  })
  @IsString()
  companyDomain: string;

  @ApiProperty({
    type: Boolean,
  })
  @IsBoolean()
  needPhone: boolean;

  @ApiProperty({
    type: Boolean,
  })
  @IsBoolean()
  needEmail: boolean;
}

export class SearchPeopleByLinkedinReqDto {
  linkedinUrl: string;
}

export class SearchPeopleResDto implements CommonResDto {
  error?: CommonErrorResDto;
  res?: SearchPeopleThirdResDto;
}
export class SearchPeopleThirdResDto {
  data: SearchPeopleThirdResDataDto;
  scroll_token: string;
  status: PeopledatalabsStatus;
  total: number;
  rateLimit: RateLimitInfo;
}
export class SearchPeopleArrayResDto implements CommonResDto {
  error?: CommonErrorResDto;
  res?: SearchPeopleThirdArrayResDto;
}
export class SearchPeopleThirdArrayResDto {
  data: SearchPeopleThirdResDataDto[];
  scroll_token: string;
  status: PeopledatalabsStatus;
  total: number;
  rateLimit: RateLimitInfo;
}

interface RateLimit {
  minute: number;
}

interface RateLimitInfo {
  rateLimitRemaining: RateLimit;
  rateLimitReset: string;
  rateLimitLimit: RateLimit;
  totalLimitOveragesRemaining: number;
  totalLimitPurchasedRemaining: number;
  totalLimitRemaining: number;
  callCreditsType: string;
  callCreditsSpent: number;
  lifetimeUsed: number;
}
export class SearchPeopleThirdResDataDto {
  phone_numbers: string[];
  mobile_phone: string;
  phones: Phone[];
  emails: Email[];
  work_email: string;
  personal_emails: string[];
  recommended_personal_email: string;

  id: string;
  full_name: string;
  first_name: string;
  middle_initial: string;
  middle_name: string;
  last_initial: string;
  last_name: string;
  sex: string;
  birth_year: number;
  birth_date: null;
  linkedin_url: string;
  linkedin_username: string;
  linkedin_id: string;
  facebook_url: string;
  facebook_username: string;
  facebook_id: string;
  twitter_url: string;
  twitter_username: string;
  github_url: null;
  github_username: null;
  industry: string;
  job_title: string;
  job_title_role: null;
  job_title_sub_role: null;
  job_title_levels: string[];
  job_onet_code: null;
  job_company_id: string;
  job_company_name: string;
  job_company_website: string;
  job_company_size: string;
  job_company_founded: number;
  job_company_industry: string;
  job_company_linkedin_url: string;
  job_company_linkedin_id: string;
  job_company_facebook_url: string;
  job_company_twitter_url: string;
  job_company_type: string;
  job_company_ticker: null;
  job_company_location_name: string;
  job_company_location_locality: string;
  job_company_location_metro: string;
  job_company_location_region: string;
  job_company_location_geo: string;
  job_company_location_street_address: string;
  job_company_location_address_line_2: string;
  job_company_location_postal_code: string;
  job_company_location_country: string;
  job_company_location_continent: string;
  job_company_employee_count: number;
  job_company_inferred_revenue: string;
  job_company_12mo_employee_growth_rate: number;
  job_company_total_funding_raised: number;
  job_last_changed: string;
  job_last_verified: string;
  job_last_updated: string;
  job_start_date: string;
  job_summary: string;
  location_name: string;
  location_locality: string;
  location_metro: string;
  location_region: string;
  location_country: string;
  location_continent: string;
  location_street_address: null;
  location_address_line_2: null;
  location_postal_code: null;
  location_geo: string;
  location_last_updated: string;
  linkedin_connections: number;
  facebook_friends: null;
  inferred_salary: null;
  inferred_years_experience: number;
  summary: null;
  interests: string[];
  skills: string[];
  location_names: string[];
  regions: string[];
  countries: string[];
  street_addresses: unknown[];
  experience: Experience[];
  education: Education[];
  profiles: SocialProfile[];
  name_aliases: unknown[];
  possible_emails: PossibleEmail[];
  possible_profiles: PossibleProfile[];
  possible_phones: PossiblePhone[];
  possible_street_addresses: unknown[];
  possible_location_names: string[];
  possible_birth_dates: string[];
  job_history: JobHistory[];
  certifications: unknown[];
  languages: unknown[];
  first_seen: string;
  num_sources: number;
  num_records: number;
  version_status: VersionStatus;
}

interface Phone {
  number: string;
  first_seen: string;
  last_seen: string;
  num_sources: number;
}

interface Email {
  address: string;
  type: null;
  first_seen: string;
  last_seen: string;
  num_sources: number;
}

interface Experience {
  company: Company;
  location_names: string[];
  end_date: string;
  start_date: string;
  title: unknown;
  is_primary: boolean;
  summary: string;
  num_sources: number;
  first_seen: string;
  last_seen: string;
}

interface Company {
  name: string;
  size: string;
  id: string;
  founded: number;
  industry: string;
  location: Location;
  linkedin_url: string;
  linkedin_id: string;
  facebook_url: string;
  twitter_url: string;
  website: string;
  ticker: null;
  type: string;
  raw: string[];
  fuzzy_match: boolean;
}

interface Location {
  name: string;
  country: string;
  locality: string;
  continent: string;
  region: string;
  street_address: string;
  address_line_2: string;
  postal_code: string;
  geo: string;
}

interface Education {
  school: School;
  degrees: unknown[];
  start_date: string;
  end_date: string;
  majors: string[];
  minors: unknown[];
  gpa: null;
  raw: string[];
  summary: string;
}

interface School {
  name: string;
  type: string;
  id: string;
  location: Location;
  linkedin_url: string;
  facebook_url: string;
  twitter_url: string;
  linkedin_id: string;
  website: string;
  domain: string;
  raw: string[];
}

interface SocialProfile {
  network: string;
  id: string;
  url: string;
  username: string;
  num_sources: number;
  first_seen: string;
  last_seen: string;
}

interface PossibleEmail {
  address: string;
  type: null;
  first_seen: string;
  last_seen: string;
  num_sources: number;
}

interface PossibleProfile {
  network: string;
  id: null;
  url: string;
  username: string;
  num_sources: number;
  first_seen: string;
  last_seen: string;
}

interface PossiblePhone {
  number: string;
  first_seen: string;
  last_seen: string;
  num_sources: number;
}

interface JobHistory {
  company_id: string;
  company_name: string;
  job_title: string;
  job_start_date: string;
  job_end_date: string;
  job_duration_in_months: number;
}

interface VersionStatus {
  latest: string;
  current: string;
}
