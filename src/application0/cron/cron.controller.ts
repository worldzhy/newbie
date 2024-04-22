import {CronTaskService} from '@microservices/cron/cron-task.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {Prisma} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@ApiTags('Cron')
@ApiBearerAuth()
@Controller('crons')
export class CronController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cronService: CronTaskService
  ) {}

  @Get('')
  async getCrons(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number
  ) {
    const result = await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.CronTask,
      pagination: {page, pageSize},
    });

    for (let i = 0; i < result.records.length; i++) {
      const cron = result.records[i];
      const runningInfo = this.cronService.runningInfo(cron.name);
      if (runningInfo) {
        cron['lastDate'] = runningInfo.lastDate;
        cron['nextDate'] = runningInfo.nextDate;
      }
    }

    return result;
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
    return await this.prisma.cronTask.create({data: body});
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
