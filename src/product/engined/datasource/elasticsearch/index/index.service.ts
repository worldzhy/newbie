import {Injectable} from '@nestjs/common';
import {ElasticsearchDatasourceIndex, Prisma} from '@prisma/client';
import {ElasticsearchService} from '../../../../../_elastic/_elasticsearch.service';
import {PrismaService} from '../../../../../_prisma/_prisma.service';

@Injectable()
export class ElasticsearchDatasourceIndexService {
  private prisma: PrismaService = new PrismaService();
  private elasticsearch: ElasticsearchService = new ElasticsearchService();

  /**
   * Get an elasticsearch index.
   * @param {Prisma.ElasticsearchDatasourceIndexWhereUniqueInput} where
   * @returns {(Promise<ElasticsearchDatasourceIndex | null>)}
   * @memberof ElasticsearchDatasourceIndexService
   */
  async findOne(
    where: Prisma.ElasticsearchDatasourceIndexWhereUniqueInput
  ): Promise<ElasticsearchDatasourceIndex | null> {
    return await this.prisma.elasticsearchDatasourceIndex.findUnique({
      where,
    });
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

  /**
   * Get many elasticsearch indices.
   *
   * @param {{
   *     skip?: number;
   *     take?: number;
   *     where?: Prisma.ElasticsearchDatasourceIndexWhereInput;
   *     orderBy?: Prisma.ElasticsearchDatasourceIndexOrderByWithRelationAndSearchRelevanceInput;
   *     select?: Prisma.ElasticsearchDatasourceIndexSelect;
   *   }} params
   * @returns
   * @memberof ElasticsearchDatasourceIndexService
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ElasticsearchDatasourceIndexWhereInput;
    orderBy?: Prisma.ElasticsearchDatasourceIndexOrderByWithRelationAndSearchRelevanceInput;
    select?: Prisma.ElasticsearchDatasourceIndexSelect;
  }) {
    const {skip, take, where, orderBy, select} = params;

    return await this.prisma.elasticsearchDatasourceIndex.findMany({
      skip,
      take,
      where,
      orderBy,
      select,
    });
  }

  /**
   * Create an elasticsearch index.
   *
   * @param {Prisma.ElasticsearchDatasourceIndexCreateInput} data
   * @returns {Promise<ElasticsearchDatasourceIndex>}
   * @memberof ElasticsearchDatasourceIndexService
   */
  async create(
    data: Prisma.ElasticsearchDatasourceIndexCreateInput
  ): Promise<ElasticsearchDatasourceIndex> {
    return await this.prisma.elasticsearchDatasourceIndex.create({
      data,
    });
  }

  /**
   * Create many elasticsearch indices.
   * @param data
   * @returns
   */
  async createMany(data: Prisma.ElasticsearchDatasourceIndexCreateManyInput[]) {
    const result = await this.prisma.elasticsearchDatasourceIndex.createMany({
      data,
    });
    return result.count;
  }

  /**
   * Update an elasticsearch index.
   *
   * @param {{
   *     where: Prisma.ElasticsearchDatasourceIndexWhereUniqueInput;
   *     data: Prisma.ElasticsearchDatasourceIndexUpdateInput;
   *   }} params
   * @returns {Promise<ElasticsearchDatasourceIndex>}
   * @memberof ElasticsearchDatasourceIndexService
   */
  async update(params: {
    where: Prisma.ElasticsearchDatasourceIndexWhereUniqueInput;
    data: Prisma.ElasticsearchDatasourceIndexUpdateInput;
  }): Promise<ElasticsearchDatasourceIndex> {
    const {where, data} = params;
    return await this.prisma.elasticsearchDatasourceIndex.update({
      data,
      where,
    });
  }

  /**
   * Delete an elasticsearch index.
   *
   * @param {Prisma.ElasticsearchDatasourceIndexWhereUniqueInput} where
   * @returns {Promise<ElasticsearchDatasourceIndex>}
   * @memberof ElasticsearchDatasourceIndexService
   */
  async delete(
    where: Prisma.ElasticsearchDatasourceIndexWhereUniqueInput
  ): Promise<ElasticsearchDatasourceIndex> {
    return await this.prisma.elasticsearchDatasourceIndex.delete({
      where,
    });
  }

  /**
   * Delete many elasticsearch datasource indices.
   *
   * @param {Prisma.ElasticsearchDatasourceIndexWhereInput} where
   * @returns {Promise<ElasticsearchDatasourceIndex>}
   * @memberof ElasticsearchDatasourceIndexService
   */
  async deleteMany(
    where: Prisma.ElasticsearchDatasourceIndexWhereInput
  ): Promise<number> {
    const result = await this.prisma.elasticsearchDatasourceIndex.deleteMany({
      where,
    });

    return result.count;
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
