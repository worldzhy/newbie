import {Controller, Post, Body, Query} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {ConfigService} from '@nestjs/config';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {CustomLoggerService} from '@toolkit/logger/logger.service';
import {NoGuard} from '@microservices/account/security/passport/public/public.decorator';
import {SnovEmailByDomainCallbackResDto} from '@microservices/people-finder/snov/snov.dto';
import {
  PeopleFinderTaskStatus,
  PeopleFinderStatus,
} from '@microservices/people-finder/constants';
import {SnovService} from '@microservices/people-finder/snov/snov.service';
import {ProxycurlService} from '@microservices/people-finder/proxycurl/proxycurl.service';
import {PeopleFinderService} from '@microservices/people-finder/people-finder.service';

@ApiTags('People Finder')
@ApiBearerAuth()
@Controller('people-finder')
export class PeopleFinderCallbackController {
  private loggerContext = 'PeopleFinder';
  callBackOrigin: string;

  constructor(
    private readonly configService: ConfigService,
    private snovService: SnovService,
    private proxycurlService: ProxycurlService,
    private readonly peopleFinder: PeopleFinderService,
    private readonly logger: CustomLoggerService,
    private readonly prisma: PrismaService
  ) {}

  /**
   * This is the interface for callback of third-party services
   */
  @NoGuard()
  @Post('snov-hook')
  async snovHook(
    @Query('id')
    id: number,
    @Query('taskId')
    taskId: number,
    @Body()
    data: SnovEmailByDomainCallbackResDto
  ) {
    let status;
    let emails;

    if (data?.status !== 'completed') {
      status = data?.status;
    } else {
      status = PeopleFinderStatus.completed;
      if (
        data.data &&
        data.data.length > 0 &&
        data.data[0].result &&
        data.data[0].result.length > 0
      ) {
        emails = data.data[0].result.map(item => item.email);
      }
    }

    await this.snovService.searchCallback({
      id: Number(id),
      status,
      emails,
      data,
    });

    const taskRecord = await this.prisma.peopleFinderTask.update({
      where: {id: Number(taskId)},
      data: {
        status: PeopleFinderTaskStatus.completed,
      },
    });
    await this.peopleFinder.checkAndExecuteTaskBatchCallback(
      taskRecord.taskBatchId!
    );
    this.logger.log(
      `snov-hook:${id},taskId:${taskId},[res]:${JSON.stringify(data)}`,
      this.loggerContext
    );
    return 'ok';
  }
}
