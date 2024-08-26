import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {ApprovedSubnet, Prisma} from '@prisma/client';
import {CursorPipe} from '@framework/pipes/cursor.pipe';
import {OptionalIntPipe} from '@framework/pipes/optional-int.pipe';
import {OrderByPipe} from '@framework/pipes/order-by.pipe';
import {WherePipe} from '@framework/pipes/where.pipe';
import {Expose} from '../../helpers/interfaces';
import {Scopes} from '../auth/scope.decorator';
import {ApprovedSubnetsService} from './approved-subnets.service';

@Controller('users/:userId/approved-subnets')
export class ApprovedSubnetController {
  constructor(private approvedSubnetsService: ApprovedSubnetsService) {}

  /** Get approved subnets for a user */
  @Get()
  @Scopes('user-{userId}:read-approved-subnet-*')
  async getAll(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('skip', OptionalIntPipe) skip?: number,
    @Query('take', OptionalIntPipe) take?: number,
    @Query('cursor', CursorPipe) cursor?: Prisma.ApprovedSubnetWhereUniqueInput,
    @Query('where', WherePipe) where?: Record<string, number | string>,
    @Query('orderBy', OrderByPipe) orderBy?: Record<string, 'asc' | 'desc'>
  ): Promise<Expose<ApprovedSubnet>[]> {
    return this.approvedSubnetsService.getApprovedSubnets(userId, {
      skip,
      take,
      orderBy,
      cursor,
      where,
    });
  }

  /** Get an approved subnet for a user */
  @Get(':id')
  @Scopes('user-{userId}:read-approved-subnet-{id}')
  async get(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number
  ): Promise<Expose<ApprovedSubnet>> {
    return this.approvedSubnetsService.getApprovedSubnet(userId, id);
  }

  /** Delete an approved subnet for a user */
  @Delete(':id')
  @Scopes('user-{userId}:delete-approved-subnet-{id}')
  async remove(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('id', ParseIntPipe) id: number
  ): Promise<Expose<ApprovedSubnet>> {
    return this.approvedSubnetsService.deleteApprovedSubnet(userId, id);
  }
}
