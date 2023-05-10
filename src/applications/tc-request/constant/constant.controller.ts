import {Controller, Get} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';

@ApiTags('[Application] Tc Request / Constant')
@ApiBearerAuth()
@Controller('tc-constants')
export class TcConstantController {
  @Get('titles')
  listTitles(): string[] {
    return ['Miss', 'Mr', 'Mrs', 'Ms', 'Other', 'Unknown'];
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
    return ['Enhanced', 'Standard'];
  }
  @Get('marital-statuses')
  listMaritalStatuses(): string[] {
    return ['Divorced', 'Married', 'Separated', 'Single'];
  }
  /* End */
}
