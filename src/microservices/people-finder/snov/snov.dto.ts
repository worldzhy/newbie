import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsOptional} from 'class-validator';

interface Name {
  full: string;
  first: string;
  middle: string | null;
  last: string;
  nickname: string | null;
  suffix: string | null;
  title: string | null;
}

interface Address {
  street_address: string | null;
  city: string;
  region: string;
  country: string;
  postal_code: string;
}

interface Location {
  address: string;
  is_primary: boolean;
}

interface LinkedInCompany {
  id: number;
  website: string;
  url: string;
  type: string;
  size: string;
  name: string;
  founded: number;
  description: string;
  locations: Location[];
  country: string;
  specialties: any[]; // Replace 'any' with more specific type if possible
  employee_count: number;
  follower_count: number;
  logo_url: string;
}

interface Web {
  site_count: number;
  tag_count: number;
}

interface AppStore {
  app_count: number;
  sdk_count: number;
}

interface PlayStore {
  app_count: number;
  sdk_count: number;
}

interface Industry {
  id: number;
  name: string;
  is_primary: boolean;
}

interface NAICS {
  id: string;
  name: string;
}

interface Company {
  id: number;
  name: string;
  slug: string;
  rank: number;
  score: number;
  employees: number;
  rank_internetretailer: number | null;
  rank_incmagazine: number | null;
  rank_fortune: number | null;
  address: Address;
  linkedin: LinkedInCompany;
  web: Web;
  appstore: AppStore;
  playstore: PlayStore;
  industries: Industry[];
  sic: null;
  naics: NAICS[];
}

interface LinkedInLocation {
  text: string;
  country: string | null;
  city: string | null;
  region: string | null;
  district: string | null;
}

interface Seniority {
  id: number;
  seniority: string;
}

interface JobFunction {
  id: number;
  job_function: string;
}

interface EmploymentType {
  id: number;
  job_employment_type: string;
}

interface AcademicQualification {
  id: number;
  academic_qualification: string;
}

interface Position {
  id: null;
  company_id: null;
  company_name: string;
  title: string;
  is_current: boolean;
  summary: string | null;
  start_date: string;
  start_date_year: number;
  start_date_month: number;
  end_date: string | null;
  end_date_year: number | null;
  end_date_month: number | null;
  seniority: Seniority[] | null;
  job_function: JobFunction[] | null;
  employment_type: EmploymentType[] | null;
  academic_qualification: AcademicQualification[] | null;
}

interface LinkedInProfile {
  id: null;
  url: string;
  name: Name;
  headline: string | null;
  org: string;
  title: string;
  dob: string;
  slug_status: string;
  location: LinkedInLocation;
  industry: string | null;
  country: string;
  profile_pic: string;
  connections: number;
  num_recommenders: number | null;
  skills: any[]; // Replace 'any' with more specific type if possible
  summary: string;
  positions: Position[];
  education: any[]; // Replace 'any' with more specific type if possible
  volunteering: any[]; // Replace 'any' with more specific type if possible
  languages: any[]; // Replace 'any' with more specific type if possible
  certifications: any[]; // Replace 'any' with more specific type if possible
  projects: any[]; // Replace 'any' with more specific type if possible
  recommendations: any[]; // Replace 'any' with more specific type if possible
  updated_date: string;
  seniority: any[]; // Replace 'any' with more specific type if possible
  job_function: any[]; // Replace 'any' with more specific type if possible
  employment_type: any[]; // Replace 'any' with more specific type if possible
  academic_qualification: any[]; // Replace 'any' with more specific type if possible
}

export interface Result {
  id: number;
  match: string;
  name: Name;
  company: Company;
  linkedin: LinkedInProfile;
  indeed: null;
  directdials: null;
  twitter: null;
  gplus: null;
  github: null;
  emails: any[]; // Replace 'any' with more specific type if possible
}

// Usage example:
// const data: ApiResponse = {...};

export enum MixRankStatus {
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

export class EmailFinderReqDto {
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
    description: 'first_name',
  })
  @IsString()
  @IsOptional()
  first_name?: string;

  @ApiProperty({
    type: String,
    required: false,
    description: 'last_name',
  })
  @IsString()
  @IsOptional()
  last_name?: string;
}

export class PersonMatchContentResDto {
  @ApiProperty({
    type: String,
  })
  email: string;
}

export class PersonMatchThirdResDto {
  status: number;
  data: {
    total?: number;
    offset?: number;
    page_size?: number;
    results?: Result[];
    // if errors, then return errors
    errors?: {
      message: string;
    };
  };
  [x: string]: unknown;
}

export class ByDomainSearchResDto implements CommonResDto {
  error?: CommonErrorResDto;
  res?: SnovEmailByDomainResDto;
  noCredits?: boolean;
}

export class ByLinkedinSearchResDto implements CommonResDto {
  error?: CommonErrorResDto;
  res?: SnovEmailByLinkedinResDto;
  noCredits?: boolean;
}

// email
interface EmailFinderResult {
  email: string;
  smtp_status: 'valid' | 'unknown';
  is_valid_format: boolean;
  is_disposable: boolean;
  is_webmail: boolean;
  is_gibberish: boolean;
  unknown_status_reason?: string;
}

interface PersonResult {
  people: string;
  result: EmailFinderResult[];
}

interface MetaRow {
  domain: string;
  last_name: string;
  first_name: string;
}

interface SnovEmailByDomainResDto {
  status: 'completed';
  data: PersonResult[];
  meta: {
    rows: MetaRow[];
    task_hash: string;
  };
}

export {EmailFinderResult, PersonResult, MetaRow, SnovEmailByDomainResDto};

// linkedin
interface LastUpdateDate {
  date: string;
  timezone_type: number;
  timezone: string;
}

interface Job {
  companyName: string;
  position: string;
  socialLink: string;
  site: string;
  locality: string;
  state: string | null;
  city: string | null;
  street: string | null;
  street2: string | null;
  postal: string | null;
  founded: string | null;
  startDate: string | null;
  endDate: string | null;
  size: string;
  industry: string;
  companyType: string;
  country: string;
}

interface EmailInfo {
  email: string;
  status: string;
}

interface ByLinkedInPersonInfo {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  sourcePage: string;
  source: string;
  industry: string;
  country: string;
  locality: string;
  lastUpdateDate: LastUpdateDate;
  currentJob: Job[];
  previousJob: Job[];
  social: any[];
  emails: EmailInfo[];
}

interface SnovEmailByLinkedinResDto {
  success: boolean;
  data: ByLinkedInPersonInfo;
}

export {
  LastUpdateDate,
  Job,
  EmailInfo,
  ByLinkedInPersonInfo,
  SnovEmailByLinkedinResDto,
};
