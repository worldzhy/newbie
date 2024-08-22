import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {Email, Prisma} from '@prisma/client';
import {CursorPipe} from '@framework/pipes/cursor.pipe';
import {OptionalIntPipe} from '@framework/pipes/optional-int.pipe';
import {OrderByPipe} from '@framework/pipes/order-by.pipe';
import {WherePipe} from '@framework/pipes/where.pipe';
import {Expose} from '../../helpers/interfaces';
import {Scopes} from '../auth/scope.decorator';
import {CreateEmailDto} from './emails.dto';
import {EmailsService} from './emails.service';

@Controller('users/:userId/emails')
export class EmailController {
  constructor(private emailsService: EmailsService) {}

  /** Create a new email for a user */
  @Post()
  @Scopes('user-{userId}:write-email-*')
  async create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() data: CreateEmailDto
  ): Promise<Expose<Email>> {
    return this.emailsService.createEmail(userId, data);
  }

  /** Get emails for a user */
  @Get()
  @Scopes('user-{userId}:read-email-*')
  async getAll(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('skip', OptionalIntPipe) skip?: number,
    @Query('take', OptionalIntPipe) take?: number,
    @Query('cursor', CursorPipe) cursor?: Prisma.EmailWhereUniqueInput,
    @Query('where', WherePipe) where?: Record<string, number | string>,
    @Query('orderBy', OrderByPipe) orderBy?: Record<string, 'asc' | 'desc'>
  ): Promise<Expose<Email>[]> {
    return this.emailsService.getEmails(userId, {
      skip,
      take,
      orderBy,
      cursor,
      where,
    });
  }

  /** Get an email for a user */
  @Get(':id')
  @Scopes('user-{userId}:read-email-{id}')
  async get(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number
  ): Promise<Expose<Email>> {
    return this.emailsService.getEmail(userId, id);
  }

  /** Delete an email for a user */
  @Delete(':id')
  @Scopes('user-{userId}:delete-email-{id}')
  async remove(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number
  ): Promise<Expose<Email>> {
    return this.emailsService.deleteEmail(userId, id);
  }
}
