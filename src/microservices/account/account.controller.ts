import {Controller, Body, Post, Get, Req} from '@nestjs/common';
import {ApiTags, ApiBody, ApiBearerAuth} from '@nestjs/swagger';
import {VerificationCodeUse} from '@prisma/client';
import {Request} from 'express';
import {AccountService} from '@microservices/account/account.service';
import {NoGuard} from '@microservices/account/security/passport/public/public.decorator';
import {verifyEmail, verifyPhone} from '@toolkit/validators/user.validator';
import {
  NewbieException,
  NewbieExceptionType,
} from '@framework/exception/newbie.exception';

@ApiTags('Account')
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Get('me')
  @ApiBearerAuth()
  async getCurrentUser(@Req() request: Request) {
    return await this.accountService.me(request);
  }

  /* End */
}
