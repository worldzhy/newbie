import {CronTaskService} from '@microservices/cron/cron-task.service';
import {Body, Controller, Delete, Get, Param, Post} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';

@ApiTags('Cron')
@ApiBearerAuth()
@Controller('crons')
export class CronController {
  constructor(private readonly cronService: CronTaskService) {}

  @Get('')
  listCrons() {
    return this.cronService.list();
  }

  @Post('')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'A cron',
          cronTime: '1 * * * * *',
        },
      },
    },
  })
  async createCron(@Body() body: {name: string; cronTime: string}) {
    return await this.cronService.create(body);
  }

  @Post('start')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Start',
        value: {cronTaskId: 1},
      },
    },
  })
  async startCron(@Body() body: {cronTaskId: number}) {
    return await this.cronService.start(body.cronTaskId);
  }

  @Post('stop')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Stop',
        value: {cronTaskId: 1},
      },
    },
  })
  async stopCron(@Body() body: {cronTaskId: number}) {
    return await this.cronService.stop(body.cronTaskId);
  }

  @Delete(':cronTaskId')
  async deleteCron(@Param('cronTaskId') cronTaskId: number) {
    return await this.cronService.delete(cronTaskId);
  }

  /* End */
}
