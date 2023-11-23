import {IsOptional, IsNumber, IsString} from 'class-validator';

export interface BasePageDto {
  page?: number;

  pageSize?: number;

  studioId?: number;

  locationId?: number;

  startDateTime?: string;

  endDateTime?: string;
}

export interface AddClassScheduleDto {
  studioId?: number;
  locationId?: number;
  schedule?: ClassScheduleDto;
}

export interface endClassScheduleDto {
  studioId?: number;
  locationId?: number;
  scheduleId?: number;
}

export interface ClassScheduleDto {
  ClassDescriptionId?: number;
  LocationId?: number;
  StartDate?: string;
  EndDate?: string;
  StartTime?: string;
  DaySunday?: boolean;
  DayMonday?: boolean;
  DayTuesday?: boolean;
  DayWednesday?: boolean;
  DayThursday?: boolean;
  DayFriday?: boolean;
  DaySaturday?: boolean;
  StaffId?: number;
  StaffPayRate?: number;
  ResourceId?: number;
  MaxCapacity?: number;
  PricingOptionsProductIds?: number[];
  AllowDateForwardEnrollment?: boolean;
  AllowOpenEnrollment?: boolean;
  BookingStatus?: string;
  WaitlistCapacity?: number;
  WebCapacity?: number;
  EndTime?: string;
}
