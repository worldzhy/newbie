import {Controller, Get, Req} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {Request} from 'express';
import {AccountService} from './account.service';

@ApiTags('Account')
@Controller('account')
export class MeController {
  constructor(private readonly accountService: AccountService) {}

  @Get('me')
  @ApiBearerAuth()
  async getCurrentUser(@Req() request: Request) {
    return await this.accountService.me(request);
  }

  /* End */
}
