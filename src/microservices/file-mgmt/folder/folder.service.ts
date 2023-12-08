import {Injectable} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class FolderService {
  constructor(private readonly prisma: PrismaService) {}

  async checkExistence(id: number) {
    const count = await this.prisma.folder.count({
      where: {id},
    });
    return count > 0 ? true : false;
  }

  /* End */
}
