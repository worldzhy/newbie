import {BadRequestException, Injectable} from '@nestjs/common';
import {ElasticsearchDatasourceIndex, Prisma} from '@prisma/client';
import {ElasticService} from '../../../../../toolkits/elastic/elastic.service';
import {PrismaService} from '../../../../../toolkits/prisma/prisma.service';

@Injectable()
export class ElasticsearchDatasourceIndexService {
  private prisma: PrismaService = new PrismaService();
  private elastic: ElasticService = new ElasticService();

  async findUnique(
    params: Prisma.ElasticsearchDatasourceIndexFindUniqueArgs
  ): Promise<ElasticsearchDatasourceIndex | null> {
    return await this.prisma.elasticsearchDatasourceIndex.findUnique(params);
  }

  async findUniqueOrThrow(
    params: Prisma.ElasticsearchDatasourceIndexFindUniqueOrThrowArgs
  ): Promise<ElasticsearchDatasourceIndex> {
    return await this.prisma.elasticsearchDatasourceIndex.findUniqueOrThrow(
      params
    );
  }

  async findMany(
    params: Prisma.ElasticsearchDatasourceIndexFindManyArgs
  ): Promise<ElasticsearchDatasourceIndex[]> {
    return await this.prisma.elasticsearchDatasourceIndex.findMany(params);
  }

  async create(
    params: Prisma.ElasticsearchDatasourceIndexCreateArgs
  ): Promise<ElasticsearchDatasourceIndex> {
    return await this.prisma.elasticsearchDatasourceIndex.create(params);
  }

  async createMany(
    params: Prisma.ElasticsearchDatasourceIndexCreateManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.elasticsearchDatasourceIndex.createMany(params);
  }

  async update(
    params: Prisma.ElasticsearchDatasourceIndexUpdateArgs
  ): Promise<ElasticsearchDatasourceIndex> {
    return await this.prisma.elasticsearchDatasourceIndex.update(params);
  }

  async delete(
    params: Prisma.ElasticsearchDatasourceIndexDeleteArgs
  ): Promise<ElasticsearchDatasourceIndex> {
    return await this.prisma.elasticsearchDatasourceIndex.delete(params);
  }

  async deleteMany(
    params: Prisma.ElasticsearchDatasourceIndexDeleteManyArgs
  ): Promise<Prisma.BatchPayload> {
    return await this.prisma.elasticsearchDatasourceIndex.deleteMany(params);
  }

  async checkExistence(id: number): Promise<boolean> {
    const count = await this.prisma.elasticsearchDatasourceIndex.count({
      where: {id: id},
    });
    return count > 0 ? true : false;
  }

  // ! Elasticsearch indices operations    //
  // ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄ //
  // * getMapping - Get document fields    //
  // * putMapping - Create document fields //
  // ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄ //

  async createIndex(indexName: string) {
    const result = await this.elastic.indices.create({index: indexName});
    if (result.statusCode !== 200) {
      throw new BadRequestException(
        'Bad Request to create an elasticsearch index.'
      );
    }
  }

  async deleteIndex(indexName: string) {
    const result = await this.elastic.indices.delete({index: indexName});
    if (result.statusCode !== 200) {
      throw new BadRequestException(
        'Bad Request to delete an elasticsearch index.'
      );
    }
  }

  async getMapping(indexName: string) {
    const result = await this.elastic.indices.getMapping({index: indexName});
    if (result.statusCode !== 200) {
      throw new BadRequestException(
        'Bad Request to get elasticsearch index mappings.'
      );
    }
  }

  async putMapping(indexName: string, mapping: object) {
    const result = await this.elastic.indices.putMapping({
      index: indexName,
      body: mapping,
    });
    if (result.statusCode !== 200) {
      throw new BadRequestException(
        'Bad Request to put elasticsearch index mappings.'
      );
    }
  }

  async getSettings(indexName: string) {
    const result = await this.elastic.indices.getSettings();
    if (result.statusCode !== 200) {
      throw new BadRequestException(
        'Bad Request to get elasticsearch index settings.'
      );
    }
  }

  async putSettings(indexName: string) {
    const result = await this.elastic.indices.putSettings();
    if (result.statusCode !== 200) {
      throw new BadRequestException(
        'Bad Request to put elasticsearch index settings.'
      );
    }
  }

  async getIndices() {
    const indices = await this.elastic.cat.indices({
      v: true, //If true, the response includes column headings. Defaults to false.
      health: 'green',
      format: 'json',
    });
    return indices;
  }

  async getAliases() {
    const aliases = await this.elastic.cat.aliases({
      v: true,
      format: 'json',
    });
    return aliases;
  }

  /* End */
}
