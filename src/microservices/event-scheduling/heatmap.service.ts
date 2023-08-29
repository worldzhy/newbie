import {Injectable} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class HeatmapService {
  constructor(private readonly prisma: PrismaService) {}

  async getCoachAvailabilityHeatmap(params: {}) {}

  /* End */
}
