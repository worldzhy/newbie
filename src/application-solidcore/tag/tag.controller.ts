import {Controller, Get} from '@nestjs/common';
import {ApiTags, ApiBearerAuth} from '@nestjs/swagger';
import {TagService} from '@microservices/tag/tag.service';

@ApiTags('Tag')
@ApiBearerAuth()
@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get('class-installments')
  async getClassInstallments() {
    return await this.tagService.findManyInOnePage({
      where: {group: {name: {contains: 'installment', mode: 'insensitive'}}},
    });
  }

  /* End */
}
