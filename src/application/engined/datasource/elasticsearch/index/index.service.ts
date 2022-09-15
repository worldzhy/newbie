import {Injectable} from '@nestjs/common';
import {ElasticsearchDatasourceIndex, Prisma} from '@prisma/client';
import {ElasticsearchService} from '../../../../../_elastic/_elasticsearch.service';
import {PrismaService} from '../../../../../_prisma/_prisma.service';

@Injectable()
export class ElasticsearchDatasourceIndexService {
  private prisma: PrismaService = new PrismaService();
  private elasticsearch: ElasticsearchService = new ElasticsearchService();

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
    data: Prisma.ElasticsearchDatasourceIndexCreateInput
  ): Promise<ElasticsearchDatasourceIndex> {
    return await this.prisma.elasticsearchDatasourceIndex.create({
      data,
    });
  }

  async createMany(data: Prisma.ElasticsearchDatasourceIndexCreateManyInput[]) {
    const result = await this.prisma.elasticsearchDatasourceIndex.createMany({
      data,
    });
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
    const indices = await this.elasticsearch.cat.indices({
      v: true, //If true, the response includes column headings. Defaults to false.
      health: 'green',
      format: 'json',
    });
    return indices;
  }

  async getAliases() {
    const aliases = await this.elasticsearch.cat.aliases({
      v: true,
      format: 'json',
    });
    return aliases;
  }

  async getMappings(indexName: string) {
    const mappings = await this.elasticsearch.indices.getMapping({
      index: indexName,
    });
    return mappings;
  }

  /* End */
}
