import {Injectable, BadRequestException} from '@nestjs/common';
import {PrismaService} from '@framework/prisma/prisma.service';

import {
  ShortcutGroupCreateReqDto,
  ShortcutGroupUpdateReqDto,
  ShortcutItemCreateReqDto,
  ShortcutItemUpdateReqDto,
} from './shortcut.dto';
import {shortcuttatus} from './constants';
export * from './constants';

@Injectable()
export class ShortcutService {
  constructor(private readonly prisma: PrismaService) {}

  async groupCreate(body: ShortcutGroupCreateReqDto): Promise<{id: number}> {
    const {name, parentId} = body;
    const group = await this.prisma.shortcutGroup.findFirst({
      where: {
        parentId,
        name,
        deletedAt: null,
      },
    });
    if (group) {
      throw new BadRequestException('Group name already exists');
    }

    const newGroup = await this.prisma.shortcutGroup.create({
      data: {
        status: shortcuttatus.Active,
        ...body,
      },
    });
    return {id: newGroup.id};
  }

  async groupUpdate(body: ShortcutGroupUpdateReqDto): Promise<{id: number}> {
    const {id} = body;
    await this.prisma.shortcutGroup.update({
      where: {
        id,
      },
      data: {
        ...body,
      },
    });
    return {id};
  }

  async groupDelete(body: ShortcutGroupUpdateReqDto): Promise<{id: number}> {
    const {id} = body;
    await this.prisma.shortcutGroup.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
    return {id};
  }

  async itemCreate(body: ShortcutItemCreateReqDto): Promise<{id: number}> {
    const {label, groupId} = body;
    const item = await this.prisma.shortcutItem.findFirst({
      where: {
        label,
        groupId,
        deletedAt: null,
      },
    });
    if (item) {
      throw new BadRequestException('Item label already exists');
    }

    const newItem = await this.prisma.shortcutItem.create({
      data: {
        status: shortcuttatus.Active,
        ...body,
      },
    });
    return {id: newItem.id};
  }

  async itemUpdate(body: ShortcutItemUpdateReqDto): Promise<{id: number}> {
    const {id} = body;
    await this.prisma.shortcutItem.update({
      where: {
        id,
      },
      data: {
        ...body,
      },
    });
    return {id};
  }

  async itemDelete(body: ShortcutItemUpdateReqDto): Promise<{id: number}> {
    const {id} = body;
    await this.prisma.shortcutItem.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });
    return {id};
  }
}
