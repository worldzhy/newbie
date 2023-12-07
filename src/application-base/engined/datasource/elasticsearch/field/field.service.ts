import {Injectable} from '@nestjs/common';
import {ElasticsearchDatasourceIndexField, Prisma} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class ElasticsearchDatasourceIndexFieldService {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    params: Prisma.ElasticsearchDatasourceIndexFieldFindUniqueArgs
  ): Promise<ElasticsearchDatasourceIndexField | null> {
    return await this.prisma.elasticsearchDatasourceIndexField.findUnique(
      params
    );
  }

  async findManyInManyPages(
    pagination: {page: number; pageSize: number},
    findManyArgs?: Prisma.ElasticsearchDatasourceIndexFieldFindManyArgs
  ) {
    return await this.prisma.findManyInManyPages({
      model: Prisma.ModelName.ElasticsearchDatasourceIndexField,
      pagination,
      findManyArgs,
    });
  }

  async create(
    params: Prisma.ElasticsearchDatasourceIndexFieldCreateArgs
  ): Promise<ElasticsearchDatasourceIndexField> {
    return await this.prisma.elasticsearchDatasourceIndexField.create(params);
  }

  async createMany(
    params: Prisma.ElasticsearchDatasourceIndexFieldCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.elasticsearchDatasourceIndexField.createMany(
      params
    );
  }

  async update(
    params: Prisma.ElasticsearchDatasourceIndexFieldUpdateArgs
  ): Promise<ElasticsearchDatasourceIndexField> {
    return await this.prisma.elasticsearchDatasourceIndexField.update(params);
  }

  async delete(
    params: Prisma.ElasticsearchDatasourceIndexFieldDeleteArgs
  ): Promise<ElasticsearchDatasourceIndexField> {
    return await this.prisma.elasticsearchDatasourceIndexField.delete(params);
  }

  /* End */
}
