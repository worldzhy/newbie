import {Injectable, BadRequestException} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {
  GoClickGroupCreateReqDto,
  GoClickGroupUpdateReqDto,
  GoClickLinkCreateReqDto,
  GoClickLinkUpdateReqDto,
} from './go-click.dto';
import {GoClickStatus} from './constants';
export * from './constants';

@Injectable()
export class GoClickService {
  constructor(private readonly prisma: PrismaService) {}

  async groupCreate(body: GoClickGroupCreateReqDto): Promise<{id: number}> {
    const {name} = body;
    const group = await this.prisma.goClickGroup.findFirst({
      where: {
        name,
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

  async linkCreate(body: GoClickLinkCreateReqDto): Promise<{id: number}> {
    const {name} = body;
    const link = await this.prisma.goClickLink.findFirst({
      where: {
        name,
      },
    });
    if (link) {
      throw new BadRequestException('Link name already exists');
    }

    const newLink = await this.prisma.goClickLink.create({
      data: {
        status: GoClickStatus.Active,
        ...body,
      },
    });
    return {id: newLink.id};
  }

  async linkUpdate(body: GoClickLinkUpdateReqDto): Promise<{id: number}> {
    const {id} = body;
    await this.prisma.goClickLink.update({
      where: {
        id,
      },
      data: {
        ...body,
      },
    });
    return {id};
  }

  async linkDelete(body: GoClickLinkUpdateReqDto): Promise<{id: number}> {
    const {id} = body;
    await this.prisma.goClickLink.update({
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
