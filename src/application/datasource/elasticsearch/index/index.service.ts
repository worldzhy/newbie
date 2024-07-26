import {BadRequestException, Injectable} from '@nestjs/common';
import {ElasticService} from '@toolkit/elastic/elastic.service';
import {PrismaService} from '@toolkit/prisma/prisma.service';

@Injectable()
export class ElasticsearchDatasourceIndexService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly elastic: ElasticService
  ) {}

  async checkExistence(id: number): Promise<boolean> {
    const count = await this.prisma.elasticsearchDatasourceIndex.count({
      where: {id: id},
    });
    return count > 0 ? true : false;
  }

  // ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄  ⌄ //
  //   ! Elasticsearch index operations    //
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

    return result;
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

    return result;
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
    const result = await this.elastic.cat.indices({
      v: true, //If true, the response includes column headings. Defaults to false.
      health: 'green',
      format: 'json',
    });
    if (result.statusCode !== 200) {
      throw new BadRequestException(
        'Bad Request to get elasticsearch indices.'
      );
    }

    return result;
  }

  async getAliases() {
    const result = await this.elastic.cat.aliases({
      v: true,
      format: 'json',
    });
    if (result.statusCode !== 200) {
      throw new BadRequestException(
        'Bad Request to get elasticsearch aliases.'
      );
    }

    return result;
  }

  /* End */
}
