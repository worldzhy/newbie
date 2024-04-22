import {Controller, Post, Body, Get} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {Prisma} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {ClassService} from './class.service';

@ApiTags('Solidcore / Class')
@ApiBearerAuth()
@Controller('classes')
export class ClassController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly classService: ClassService
  ) {}

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

  @Get('installments')
  async getClassInstallments() {
    return await this.prisma.findManyInOnePage({
      model: Prisma.ModelName.Tag,
      findManyArgs: {
        where: {group: {name: {contains: 'installment', mode: 'insensitive'}}},
      },
    });
  }
  /* End */
}
