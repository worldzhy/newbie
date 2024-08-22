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
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {TagGroup, Prisma} from '@prisma/client';
import {PrismaService} from '@framework/prisma/prisma.service';

@ApiTags('Tag / Group')
@ApiBearerAuth()
@Controller('tag-groups')
export class TagGroupController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('')
  @ApiBody({
    description: "The 'name' is required in request body.",
    examples: {
      a: {
        summary: '1. Create',
        value: {name: 'Group 1'},
      },
    },
  })
  async createTagGroup(
    @Body() body: Prisma.TagGroupUncheckedCreateInput
  ): Promise<TagGroup> {
    return await this.prisma.tagGroup.create({
      data: body,
    });
  }

  @Get('')
  async getTagGroups(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.TagGroup,
      pagination: {page, pageSize},
    });
  }

  @Get(':tagGroupId')
  async getTagGroup(
    @Param('tagGroupId') tagGroupId: number
  ): Promise<TagGroup> {
    return await this.prisma.tagGroup.findUniqueOrThrow({
      where: {id: tagGroupId},
    });
  }

  @Patch(':tagGroupId')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Update',
        value: {name: 'Group 2'},
      },
    },
  })
  async updateTagGroup(
    @Param('tagGroupId') tagGroupId: number,
    @Body()
    body: Prisma.TagGroupUpdateInput
  ): Promise<TagGroup> {
    return await this.prisma.tagGroup.update({
      where: {id: tagGroupId},
      data: body,
    });
  }

  @Delete(':tagGroupId')
  async deleteTagGroup(
    @Param('tagGroupId') tagGroupId: number
  ): Promise<TagGroup> {
    return await this.prisma.tagGroup.delete({
      where: {id: tagGroupId},
    });
  }

  /* End */
}
