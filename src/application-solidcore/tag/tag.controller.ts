import {Controller, Get} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {Prisma} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@ApiTags('Tag')
@ApiBearerAuth()
@Controller('tags')
export class TagController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('class-installments')
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
