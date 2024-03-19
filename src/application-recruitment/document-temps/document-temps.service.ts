import {Injectable} from '@nestjs/common';
import {DocumentTemplate, Prisma} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class DocumentTemplateService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    params: Prisma.DocumentTemplateFindUniqueArgs
  ): Promise<DocumentTemplate | null> {
    return await this.prisma.documentTemplate.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.DocumentTemplateFindUniqueOrThrowArgs
  ): Promise<DocumentTemplate> {
    return await this.prisma.documentTemplate.findUniqueOrThrow(params);
  }

  async findMany(
    params: Prisma.DocumentTemplateFindManyArgs
  ): Promise<DocumentTemplate[]> {
    return await this.prisma.documentTemplate.findMany(params);
  }

  async count(params: Prisma.DocumentTemplateCountArgs): Promise<number> {
    return await this.prisma.documentTemplate.count(params);
  }

  async create(
    params: Prisma.DocumentTemplateCreateArgs
  ): Promise<DocumentTemplate> {
    return await this.prisma.documentTemplate.create(params);
  }

  async update(
    params: Prisma.DocumentTemplateUpdateArgs
  ): Promise<DocumentTemplate> {
    return await this.prisma.documentTemplate.update(params);
  }

  async delete(
    params: Prisma.DocumentTemplateDeleteArgs
  ): Promise<DocumentTemplate> {
    return await this.prisma.documentTemplate.delete(params);
  }

  async checkExistence(id: string) {
    const count = await this.prisma.document.count({
      where: {id},
    });
    return count > 0 ? true : false;
  }

  /* End */
}
