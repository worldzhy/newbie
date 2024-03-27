import {JobQueueService} from '@microservices/job-queue/job-queue.service';
import {Controller, Post, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {Job, JobStatus} from 'bull';

@ApiTags('Job Queue')
@ApiBearerAuth()
@Controller('job-queue')
export class JobQueueController {
  constructor(private readonly jobQueueService: JobQueueService) {}

  @Post('pause')
  async pause() {
    await this.jobQueueService.pause();
  }

  @Post('resume')
  async resume() {
    await this.jobQueueService.resume();
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
    return await this.jobQueueService.addJob(body.data); // Delay the start of a job for 1 second.
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
  async addJobs(@Body() body: {dataArray: object[]}): Promise<Job[]> {
    return await this.jobQueueService.addJobs(body.dataArray); // Delay the start of a job for 1 second.
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
    return await this.jobQueueService.getJobs(body.types);
  }

  /* End */
}
