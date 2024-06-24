import {Injectable, BadRequestException} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';

import {GoogleDriveService} from '@microservices/storage/google-drive/google-drive.service';
import {
  GoClickGroupCreateReqDto,
  GoClickGroupUpdateReqDto,
  GoClickItemCreateReqDto,
  GoClickItemUpdateReqDto,
} from './go-click.dto';
import {GoClickStatus} from './constants';
export * from './constants';

@Injectable()
export class GoClickService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly googleDriveService: GoogleDriveService
  ) {}

  async groupCreate(body: GoClickGroupCreateReqDto): Promise<{id: number}> {
    const {name, parentId} = body;
    const group = await this.prisma.goClickGroup.findFirst({
      where: {
        parentId,
        name,
        deletedAt: null,
      },
    });
    if (group) {
      throw new BadRequestException('Group name already exists');
    }

    const newGroup = await this.prisma.goClickGroup.create({
      data: {
        status: GoClickStatus.Active,
        ...body,
      },
    });
    return {id: newGroup.id};
  }

  async groupUpdate(body: GoClickGroupUpdateReqDto): Promise<{id: number}> {
    const {id} = body;
    await this.prisma.goClickGroup.update({
      where: {
        id,
      },
      data: {
        ...body,
      },
    });
    return {id};
  }

  async groupDelete(body: GoClickGroupUpdateReqDto): Promise<{id: number}> {
    const {id} = body;
    await this.prisma.goClickGroup.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
    return {id};
  }

  async itemCreate(body: GoClickItemCreateReqDto): Promise<{id: number}> {
    const {label} = body;
    const item = await this.prisma.goClickItem.findFirst({
      where: {
        label,
        deletedAt: null,
      },
    });
    if (item) {
      throw new BadRequestException('Item label already exists');
    }

    const newItem = await this.prisma.goClickItem.create({
      data: {
        status: GoClickStatus.Active,
        ...body,
      },
    });
    return {id: newItem.id};
  }

  async itemUpdate(body: GoClickItemUpdateReqDto): Promise<{id: number}> {
    const {id} = body;
    await this.prisma.goClickItem.update({
      where: {
        id,
      },
      data: {
        ...body,
      },
    });
    return {id};
  }

  async itemDelete(body: GoClickItemUpdateReqDto): Promise<{id: number}> {
    const {id} = body;
    await this.prisma.goClickItem.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
    return {id};
  }

  /**
   * Remove all files.
   */
  private async deleteGoogleDriveAll() {
    // Find root files.
    const filesInFolder = await this.prisma.googleFile.findMany({
      where: {parentId: null},
      select: {id: true},
    });

    for (let i = 0; i < filesInFolder.length; i++) {
      await this.googleDriveService.deleteFileRecursively(filesInFolder[i].id);
    }
  }
  /**
   * Initialize Example files.
   */
  async initGoogleDriveExample() {
    await this.deleteGoogleDriveAll();

    const exampleFolder = await this.googleDriveService.createFolder({
      name: 'ExampleFolder',
    });
    await this.googleDriveService.createDocument({
      name: 'Example Document',
    });
    await this.googleDriveService.createSheet({
      name: 'Example Sheet',
    });
    await this.googleDriveService.createDocument({
      name: 'Example Document 2',
      parentId: exampleFolder.id,
    });
  }
}
