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
import {Tag, Prisma} from '@prisma/client';
import {TagService} from '@microservices/tag/tag.service';
import {
  generatePaginationParams,
  generatePaginationResponse,
} from '@toolkit/pagination/pagination';

@ApiTags('Tag')
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
  @ApiQuery({name: 'groupId', type: 'number'})
  @ApiQuery({name: 'page', type: 'number'})
  @ApiQuery({name: 'pageSize', type: 'number'})
  async getTags(
    @Query('groupId') groupId?: number,
    @Query('groupId') page?: number,
    @Query('groupId') pageSize?: number
  ) {
    // [step 1] Construct where argument.
    let where: Prisma.TagWhereInput | undefined;
    const whereConditions: object[] = [];
    if (groupId) {
      whereConditions.push({groupId});
    }

    if (whereConditions.length > 1) {
      where = {OR: whereConditions};
    } else if (whereConditions.length === 1) {
      where = whereConditions[0];
    } else {
      // where === undefined
    }

    // [step 2] Construct take and skip arguments.
    const {take, skip} = generatePaginationParams({
      page: page,
      pageSize: pageSize,
    });

    const [records, total] = await this.tagService.findManyWithTotal({
      where,
      take,
      skip,
    });

    return generatePaginationResponse({page, pageSize, records, total});
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
