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
import {Membership, Prisma} from '@prisma/client';
import {CursorPipe} from '@framework/pipes/cursor.pipe';
import {OptionalIntPipe} from '@framework/pipes/optional-int.pipe';
import {OrderByPipe} from '@framework/pipes/order-by.pipe';
import {WherePipe} from '@framework/pipes/where.pipe';
import {Expose} from '../../helpers/interfaces';
import {Scopes} from '../auth/scope.decorator';
import {CreateGroupDto} from '../groups/groups.dto';
import {MembershipsService} from './memberships.service';

@Controller('users/:userId/memberships')
export class UserMembershipController {
  constructor(private membershipsService: MembershipsService) {}

  @Post()
  @Scopes('user-{userId}:write-membership-*')
  async create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() data: CreateGroupDto
  ): Promise<Expose<Membership>> {
    return this.membershipsService.createUserMembership(userId, data);
  }

  /** Get memberships for a user */
  @Get()
  @Scopes('user-{userId}:read-membership-*')
  async getAll(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('skip', OptionalIntPipe) skip?: number,
    @Query('take', OptionalIntPipe) take?: number,
    @Query('cursor', CursorPipe) cursor?: Prisma.MembershipWhereUniqueInput,
    @Query('where', WherePipe) where?: Record<string, number | string>,
    @Query('orderBy', OrderByPipe) orderBy?: Record<string, 'asc' | 'desc'>
  ): Promise<Expose<Membership>[]> {
    return this.membershipsService.getMemberships({
      skip,
      take,
      orderBy,
      cursor,
      where: {...where, user: {id: userId}},
    });
  }

  /** Get a membership for a user */
  @Get(':id')
  @Scopes('user-{userId}:read-membership-{id}')
  async get(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number
  ): Promise<Expose<Membership>> {
    return this.membershipsService.getUserMembership(userId, id);
  }

  /** Delete a membership for a user */
  @Delete(':id')
  @Scopes('user-{userId}:delete-membership-{id}')
  async remove(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number
  ): Promise<Expose<Membership>> {
    return this.membershipsService.deleteUserMembership(userId, id);
  }
}
