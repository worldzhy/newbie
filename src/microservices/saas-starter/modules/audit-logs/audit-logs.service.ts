import {Injectable} from '@nestjs/common';
import type {Prisma} from '@prisma/client';
import {AuditLog} from '@prisma/client';
import {Expose} from '../../helpers/interfaces';
import {expose} from '../../helpers/expose';
import {PrismaService} from '@framework/prisma/prisma.service';

@Injectable()
export class AuditLogsService {
  constructor(private prisma: PrismaService) {}

  async getAuditLogs(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.AuditLogWhereUniqueInput;
    where?: Prisma.AuditLogWhereInput;
    orderBy?: Prisma.AuditLogOrderByWithAggregationInput;
  }): Promise<Expose<AuditLog>[]> {
    const {skip, take, cursor, where, orderBy} = params;
    try {
      const AuditLog = await this.prisma.auditLog.findMany({
        skip,
        take,
        cursor,
        where,
        orderBy,
        include: {group: true, user: true},
      });
      return AuditLog.map(group => expose<AuditLog>(group));
    } catch (error) {
      return [];
    }
  }
}
