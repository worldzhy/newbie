import {Inject, Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Cron} from '@nestjs/schedule';
import {AvailabilityService} from './availability.service';
import {AvailabilityExpressionService} from '@microservices/event-scheduling/availability-expression.service';
import {AvailabilityExpressionStatus} from '@prisma/client';
import {QueueService} from '@microservices/queue/queue.service';
import {CACHE_MANAGER} from '@nestjs/cache-manager';
import {Cache} from 'cache-manager';

const cluster = require('node:cluster');

@Injectable()
export class AvailabilityJobProducer {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
    private readonly availabilityService: AvailabilityService,
    private readonly availabilityExpressionService: AvailabilityExpressionService,
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
    await this.availabilityService.fetchGoogleForm();

    // [step 2] Get unpublished expressions.
    const exps = await this.availabilityExpressionService.findMany({
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
