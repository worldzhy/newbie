import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import {TagGroup, Prisma} from '@prisma/client';
import {TagGroupService} from '@microservices/tag/tag-group.service';

@ApiTags('Tag Group')
@ApiBearerAuth()
@Controller('tag-groups')
export class TagGroupController {
  constructor(private readonly tagGroupService: TagGroupService) {}

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
  async createTagGroup(
    @Body() body: Prisma.TagGroupUncheckedCreateInput
  ): Promise<TagGroup> {
    return await this.tagGroupService.create({
      data: body,
    });
  }

  @Get('')
  @ApiQuery({name: 'page', type: 'number'})
  @ApiQuery({name: 'pageSize', type: 'number'})
  async getTagGroups(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number
  ) {
    return await this.tagGroupService.findManyWithPagination(
      {},
      {page, pageSize}
    );
  }

  @Get(':tagGroupId')
  @ApiParam({
    name: 'tagGroupId',
    schema: {type: 'number'},
    description: 'The id of the event type.',
    example: 1,
  })
  async getTagGroup(
    @Param('tagGroupId') tagGroupId: number
  ): Promise<TagGroup> {
    return await this.tagGroupService.findUniqueOrThrow({
      where: {id: tagGroupId},
    });
  }

  @Patch(':tagGroupId')
  @ApiParam({
    name: 'tagGroupId',
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
  async updateTagGroup(
    @Param('tagGroupId') tagGroupId: number,
    @Body()
    body: Prisma.TagGroupUpdateInput
  ): Promise<TagGroup> {
    return await this.tagGroupService.update({
      where: {id: tagGroupId},
      data: body,
    });
  }

  @Delete(':tagGroupId')
  @ApiParam({
    name: 'tagGroupId',
    schema: {type: 'number'},
    example: 1,
  })
  async deleteTagGroup(
    @Param('tagGroupId') tagGroupId: number
  ): Promise<TagGroup> {
    return await this.tagGroupService.delete({
      where: {id: tagGroupId},
    });
  }

  /* End */
}
