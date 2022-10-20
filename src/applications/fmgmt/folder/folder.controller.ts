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
import {FolderService} from './folder.service';
import {Prisma, Folder} from '@prisma/client';

@ApiTags('[Application] File Management / Folder')
@ApiBearerAuth()
@Controller('folders')
export class FolderController {
  private folderService = new FolderService();

  //* Create
  @Post('')
  @ApiBody({
    description: '',
    examples: {
      a: {
        summary: '1. Create',
        value: {name: 'RootFolder'},
      },
    },
  })
  async createFolder(@Body() body: Prisma.FolderCreateInput): Promise<Folder> {
    return await this.folderService.create({data: body});
  }

  //* Get many
  @Get('')
  async getFolders(): Promise<Folder[]> {
    return await this.folderService.findMany({});
  }

  //* Get
  @Get(':folderId')
  @ApiParam({
    name: 'folderId',
    schema: {type: 'string'},
    description: 'The uuid of the folder.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async getFolder(@Param('folderId') folderId: string): Promise<Folder | null> {
    return await this.folderService.findUnique({
      where: {id: folderId},
    });
  }

  //* Update
  @Patch(':folderId')
  @ApiParam({
    name: 'folderId',
    schema: {type: 'string'},
    description: 'The uuid of the folder.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  @ApiBody({
    description:
      "The 'folderName', 'clientName' and 'clientEmail' are required in request body.",
    examples: {
      a: {
        summary: '1. Update',
        value: {
          name: 'Galaxy',
          clientName: 'Henry Zhao',
          clientEmail: 'henry@inceptionpad.com',
        },
      },
    },
  })
  async updateFolder(
    @Param('folderId') folderId: string,
    @Body() body: Prisma.FolderUpdateInput
  ): Promise<Folder> {
    return await this.folderService.update({
      where: {id: folderId},
      data: body,
    });
  }

  //* Delete
  @Delete(':folderId')
  @ApiParam({
    name: 'folderId',
    schema: {type: 'string'},
    description: 'The uuid of the folder.',
    example: 'd8141ece-f242-4288-a60a-8675538549cd',
  })
  async deleteFolder(@Param('folderId') folderId: string): Promise<Folder> {
    return await this.folderService.delete({where: {id: folderId}});
  }

  /* End */
}
