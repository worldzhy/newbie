import {Controller, Post, Body} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {ClassService} from './class.service';

@ApiTags('Class')
@ApiBearerAuth()
@Controller('classes')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Post('merge')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Merge',
        value: {
          fromEventTypeId: 20,
          toEventTypeId: 1,
        },
      },
    },
  })
  async mergeEventType(
    @Body() body: {fromEventTypeId: number; toEventTypeId: number}
  ): Promise<number> {
    return await this.classService.merge(
      body.fromEventTypeId,
      body.toEventTypeId
    );
  }

  /* End */
}
