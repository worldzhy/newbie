import {Controller, Get} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {Public} from '../../account/authentication/public/public.decorator';

@ApiTags('[Application] Tc Request / Constant')
@Public()
@Controller('tc-constants')
export class TcConstantController {
  @Get('titles')
  listTitles(): string[] {
    return ['Miss', 'Mr', 'Mrs', 'Ms', 'Other', 'Unknown'];
  }

  @Get('genders')
  listGenders(): string[] {
    return [
      'Female',
      'Gender Fluid',
      'Male',
      'Prefer not to say',
      'Prefer to self-describe',
      'Third Gender',
      'Transgender',
      'Unknown',
    ];
  }

  @Get('purposes')
  listPurposes(): string[] {
    return [
      'Adoption',
      'Airport ID',
      'FreeLancer',
      'Government or Statutory Employment',
      'International or Regional Travel',
      'International or Regional Applications',
      'Naturalisation',
      'Other',
      'Private Sector Employment',
      'Resident Permit Application',
      'Work Permit Application',
      'Emergency Travel',
    ];
  }

  @Get('scope-of-convictions')
  listScopeOfConvictions(): string[] {
    return [
      'ENHANCED - Includes all convictions and cautions including those spent',
      'STANDARD - Includes all current convictions and cautions',
    ];
  }

  @Get('marital-statuses')
  listMaritalStatuses(): string[] {
    return ['Divorced', 'Married', 'Separated', 'Single'];
  }

  @Get('islands')
  listIslands(): string[] {
    return [
      'Ambergris Cay',
      'Grand Turk',
      'Middle Caicos',
      'North Caicos',
      'Parrot Cay',
      'Pine Cay',
      'Providenciales',
      'Salt Cay',
      'South Caicos',
      'Not on Turks & Caicos Islands',
    ];
  }

  /* End */
}
