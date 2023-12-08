import {Injectable} from '@nestjs/common';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class FileService {
  constructor(private readonly prisma: PrismaService) {}

  async checkExistence(id: string) {
    const count = await this.prisma.file.count({
      where: {id},
    });
    return count > 0 ? true : false;
  }

  /* End */
}
