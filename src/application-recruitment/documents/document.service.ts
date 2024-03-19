import {Injectable} from '@nestjs/common';
import {
  Prisma,
  Document,
  DocumentHistory,
  DocumentContent,
  DocumentContentJobCode,
  DocumentContentEssentialFunction,
} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class DocumentService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    params: Prisma.DocumentFindUniqueArgs
  ): Promise<Document | null> {
    return await this.prisma.document.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.DocumentFindUniqueOrThrowArgs
  ): Promise<Document> {
    return await this.prisma.document.findUniqueOrThrow(params);
  }

  async findMany(params: Prisma.DocumentFindManyArgs): Promise<Document[]> {
    return await this.prisma.document.findMany(params);
  }

  async count(params: Prisma.DocumentCountArgs): Promise<number> {
    return await this.prisma.document.count(params);
  }

  async create(params: Prisma.DocumentCreateArgs): Promise<Document> {
    return await this.prisma.document.create(params);
  }

  async update(params: Prisma.DocumentUpdateArgs): Promise<Document> {
    return await this.prisma.document.update(params);
  }

  async delete(params: Prisma.DocumentDeleteArgs): Promise<Document> {
    return await this.prisma.document.delete(params);
  }

  async checkExistence(id: string) {
    const count = await this.prisma.document.count({
      where: {id},
    });
    return count > 0 ? true : false;
  }

  async createHistory(
    params: Prisma.DocumentHistoryCreateArgs
  ): Promise<DocumentHistory> {
    return await this.prisma.documentHistory.create(params);
  }

  async findHistory(
    params: Prisma.DocumentHistoryFindUniqueOrThrowArgs
  ): Promise<DocumentHistory | null> {
    return await this.prisma.documentHistory.findUnique(params);
  }

  async findDocumentContent(
    params: Prisma.DocumentContentFindManyArgs
  ): Promise<DocumentContent[]> {
    return await this.prisma.documentContent.findMany(params);
  }

  async findDocumentContentEssentialFunction(
    params: Prisma.DocumentContentEssentialFunctionFindManyArgs
  ): Promise<DocumentContentEssentialFunction[]> {
    return await this.prisma.documentContentEssentialFunction.findMany(params);
  }

  async findDocumentContentJobCode(
    params: Prisma.DocumentContentJobCodeFindManyArgs
  ): Promise<DocumentContentJobCode[]> {
    return await this.prisma.documentContentJobCode.findMany(params);
  }

  /* End */
}
