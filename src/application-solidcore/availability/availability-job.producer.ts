import {Inject, Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {CACHE_MANAGER} from '@nestjs/cache-manager';
import {Cache} from 'cache-manager';
import {Cron} from '@nestjs/schedule';
import {AvailabilityLoadService} from './availability-load.service';
import {AvailabilityExpressionStatus} from '@prisma/client';
import {QueueService} from '@microservices/queue/queue.service';

import {currentQuarter} from '@toolkit/utilities/datetime.util';
import {PrismaService} from '@toolkit/prisma/prisma.service';

const cluster = require('node:cluster');

const LAST_DAY_FOR_EACH_QUARTER = 10;

@Injectable()
export class AvailabilityJobProducer {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly availabilityLoadService: AvailabilityLoadService,
    private readonly queueService: QueueService
  ) {}

  @Cron('1 1 1 1 *')
  async handleCron() {
    if (
      !this.configService.getOrThrow<boolean>('server.isPrimary') ||
      cluster.worker.id !== 1
    ) {
      return; // Only the first worker process of the primary server execute the cronjob.
    }

    // [step 1] Fetch google form to create availability expressions.
    const now = new Date();
    let year = now.getFullYear();
    const month = now.getMonth() + 1;
    const dayOfMonth = now.getDate();
    let quarter = currentQuarter();

    if ([1, 2, 3].includes(month)) {
      quarter = 1;
      if (month === 3 && dayOfMonth > LAST_DAY_FOR_EACH_QUARTER) {
        quarter = 2;
      }
    } else if ([4, 5, 6].includes(month)) {
      quarter = 2;
      if (month === 6 && dayOfMonth > LAST_DAY_FOR_EACH_QUARTER) {
        quarter = 3;
      }
    } else if ([7, 8, 9].includes(month)) {
      quarter = 3;
      if (month === 9 && dayOfMonth > LAST_DAY_FOR_EACH_QUARTER) {
        quarter = 4;
      }
    } else if ([10, 11, 12].includes(month)) {
      quarter = 4;
      if (month === 12 && dayOfMonth > LAST_DAY_FOR_EACH_QUARTER) {
        quarter = 1;
        year += 1;
      }
    }
    await this.availabilityLoadService.fetchGoogleForm({year, quarter});

    // [step 2] Get unpublished expressions.
    const exps = await this.prisma.availabilityExpression.findMany({
      where: {status: AvailabilityExpressionStatus.EDITING},
      select: {id: true},
    });

    // [step 3] Add to task queue.
    if (exps.length > 0) {
      // Clean queue jobs and http response cache.
      await this.cacheManager.reset();

      await this.queueService.addJobs(
        exps.map(exp => {
          return {availabilityExpressionId: exp.id};
        })
      );
    }
  }
}
