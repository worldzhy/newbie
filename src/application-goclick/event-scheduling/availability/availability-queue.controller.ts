import {EventSchedulingQueue} from '@microservices/event-scheduling/availability.processor';
import {InjectQueue} from '@nestjs/bull';
import {Controller, Post, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {Job, JobStatus, Queue} from 'bull';

@ApiTags('Event Scheduling / Queue')
@ApiBearerAuth()
@Controller('availability-queue')
export class AvailabilityQueueController {
  constructor(@InjectQueue(EventSchedulingQueue) private queue: Queue) {}

  @Post('pause')
  async pause() {
    await this.queue.pause();
  }

  @Post('resume')
  async resume() {
    await this.queue.resume();
  }

  @Post('add-job')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Add job',
        value: {
          data: {availabilityExpressionId: 1},
        },
      },
    },
  })
  async addJob(@Body() body: {data: object}): Promise<Job> {
    return await this.queue.add(body.data); // Delay the start of a job for 1 second.
  }

  @Post('add-jobs')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Add jobs',
        value: {
          dataArray: [
            {availabilityExpressionId: 1},
            {availabilityExpressionId: 2},
          ],
        },
      },
    },
  })
  async addJobs(
    @Body()
    body: {
      data:
        | {availabilityExpressionId: number}[]
        | {availabilityExpressionId: number};
    }
  ): Promise<Job[] | Job> {
    if (Array.isArray(body.data)) {
      return await this.queue.addBulk(
        body.data.map(item => {
          return {data: item, delay: 1000}; // Delay the start of a job for 1 second.
        })
      );
    }

    return await this.queue.add(body.data); // Delay the start of a job for 1 second.
  }

  @Post('get-jobs')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Get jobs',
        value: {
          types: [
            'completed',
            'waiting',
            'active',
            'delayed',
            'failed',
            'paused',
          ],
        },
      },
    },
  })
  async getJobs(@Body() body: {types: JobStatus[]}) {
    return await this.queue.getJobs(body.types);
  }

  /* End */
}
