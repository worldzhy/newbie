import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiParam, ApiBody} from '@nestjs/swagger';
import {Tag, Prisma} from '@prisma/client';
import {TagService} from '@microservices/event-scheduling/tag.service';

@ApiTags('Event Scheduling / Tag')
@ApiBearerAuth()
@Controller('tags')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post('')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {
          name: 'well-experienced',
          group: 'Coach',
        },
      },
    },
  })
  async createTag(@Body() body: Prisma.TagUncheckedCreateInput): Promise<Tag> {
    return await this.tagService.create({
      data: body,
    });
  }

  @Get('')
  async getTages(): Promise<Tag[]> {
    return await this.tagService.findMany({});
  }

  @Get(':tagId')
  @ApiParam({
    name: 'tagId',
    schema: {type: 'number'},
    description: 'The id of the event type.',
    example: 1,
  })
  async getTag(@Param('tagId') tagId: number): Promise<Tag> {
    return await this.tagService.findUniqueOrThrow({
      where: {id: tagId},
    });
  }

  @Patch(':tagId')
  @ApiParam({
    name: 'tagId',
    schema: {type: 'number'},
    description: 'The id of the event type.',
    example: 1,
  })
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {
          name: 'non-experienced',
          group: 'Coach',
        },
      },
    },
  })
  async updateTag(
    @Param('tagId') tagId: number,
    @Body()
    body: Prisma.TagUpdateInput
  ): Promise<Tag> {
    return await this.tagService.update({
      where: {id: tagId},
      data: body,
    });
  }

  @Delete(':tagId')
  @ApiParam({
    name: 'tagId',
    schema: {type: 'number'},
    example: 1,
  })
  async deleteTag(@Param('tagId') tagId: number): Promise<Tag> {
    return await this.tagService.delete({
      where: {id: tagId},
    });
  }

  /* End */
}
