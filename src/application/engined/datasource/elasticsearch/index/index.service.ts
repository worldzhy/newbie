import {Injectable} from '@nestjs/common';
import {ElasticsearchDatasourceIndex, Prisma} from '@prisma/client';
import {ElasticService} from '../../../../../tools/elastic/elastic.service';
import {PrismaService} from '../../../../../tools/prisma/prisma.service';

@Injectable()
export class ElasticsearchDatasourceIndexService {
  private prisma: PrismaService = new PrismaService();
  private elastic: ElasticService = new ElasticService();

  async findUnique(
    params: Prisma.ElasticsearchDatasourceIndexFindUniqueArgs
  ): Promise<ElasticsearchDatasourceIndex | null> {
    return await this.prisma.elasticsearchDatasourceIndex.findUnique(params);
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

  async createMany(params: Prisma.ElasticsearchDatasourceIndexCreateManyArgs) {
    const result = await this.prisma.elasticsearchDatasourceIndex.createMany(
      params
    );
    return result.count;
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
  ): Promise<number> {
    const result = await this.prisma.elasticsearchDatasourceIndex.deleteMany(
      params
    );

    return result.count;
  }

  /**
   * Check if exist
   *
   * @param {number} id
   * @returns
   * @memberof ElasticsearchDatasourceIndexService
   */
  async checkExistence(id: number) {
    const count = await this.prisma.elasticsearchDatasourceIndex.count({
      where: {id: id},
    });

    return count > 0 ? true : false;
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

  async getMappings(indexName: string) {
    const mappings = await this.elastic.indices.getMapping({
      index: indexName,
    });
    return mappings;
  }

  /* End */
}
