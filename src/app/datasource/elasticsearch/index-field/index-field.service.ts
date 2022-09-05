import {Injectable} from '@nestjs/common';
import {
  DatasourceElasticsearch,
  DatasourceElasticsearchIndexField,
  Prisma,
} from '@prisma/client';
import {ElasticsearchService} from 'src/_elasticsearch/_elasticsearch.service';
import {PrismaService} from '../../../../_prisma/_prisma.service';

@Injectable()
export class DatasourceElasticsearchIndexFieldService {
  private prisma: PrismaService = new PrismaService();
  private elasticsearch: ElasticsearchService = new ElasticsearchService();

  /**
   * Generate the table relations of the schema.
   * @param datasource
   * @returns
   */
  async extract(datasource: DatasourceElasticsearch) {
    // [step 1] Get mappings of all indices.
    const result = await this.elasticsearch.indices.getMapping();
    if (result.statusCode !== 200) {
      return;
    }

    // [step 2] Save fields of all indices.
    const indexNames = Object.keys(result.body);
    for (let index = 0; index < indexNames.length; index++) {
      const indexName = indexNames[index];
      if (indexName.startsWith('.')) {
        // The index name starts with '.' is not the customized index name.
        continue;
      }

      // Save fields of an index.
      const fieldNames = Object.keys(
        result.body[indexName].mappings.properties
      );
      await this.createMany(
        fieldNames.map(fieldName => {
          return {
            index: indexName,
            field: fieldName,
            fieldBody: result.body[indexName].mappings.properties[fieldName],
            datasourceId: datasource.id,
          };
        })
      );
    }
  }

  /**
   * Get a datasourcePostgresql table column
   * @param {Prisma.DatasourceElasticsearchIndexFieldWhereUniqueInput} where
   * @returns {(Promise<DatasourceElasticsearchIndexField | null>)}
   * @memberof DatasourceElasticsearchIndexFieldService
   */
  async findOne(
    where: Prisma.DatasourceElasticsearchIndexFieldWhereUniqueInput
  ): Promise<DatasourceElasticsearchIndexField | null> {
    return await this.prisma.datasourceElasticsearchIndexField.findUnique({
      where,
    });
  }

  /**
   * Get many datasourcePostgresql table columns
   *
   * @param {{
   *     skip?: number;
   *     take?: number;
   *     where?: Prisma.DatasourceElasticsearchIndexFieldWhereInput;
   *     orderBy?: Prisma.DatasourceElasticsearchIndexFieldOrderByWithRelationAndSearchRelevanceInput;
   *     select?: Prisma.DatasourceElasticsearchIndexFieldSelect;
   *   }} params
   * @returns
   * @memberof DatasourceElasticsearchIndexFieldService
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.DatasourceElasticsearchIndexFieldWhereInput;
    orderBy?: Prisma.DatasourceElasticsearchIndexFieldOrderByWithRelationAndSearchRelevanceInput;
    select?: Prisma.DatasourceElasticsearchIndexFieldSelect;
  }) {
    const {skip, take, where, orderBy, select} = params;

    return await this.prisma.datasourceElasticsearchIndexField.findMany({
      skip,
      take,
      where,
      orderBy,
      select,
    });
  }

  /**
   * Get columns by group.
   * @param params
   * @returns
   */
  async groupBy(params: {
    by: Prisma.DatasourceElasticsearchIndexFieldScalarFieldEnum[];
    where: Prisma.DatasourceElasticsearchIndexFieldWhereInput;
    orderBy?: Prisma.DatasourceElasticsearchIndexFieldOrderByWithAggregationInput;
  }) {
    return await this.prisma.datasourceElasticsearchIndexField.groupBy(params);
  }

  /**
   * Create a datasourcePostgresql table column
   *
   * @param {Prisma.DatasourceElasticsearchIndexFieldCreateInput} data
   * @returns {Promise<DatasourceElasticsearchIndexField>}
   * @memberof DatasourceElasticsearchIndexFieldService
   */
  async create(
    data: Prisma.DatasourceElasticsearchIndexFieldCreateInput
  ): Promise<DatasourceElasticsearchIndexField> {
    return await this.prisma.datasourceElasticsearchIndexField.create({
      data,
    });
  }

  /**
   * Create many datasourcePostgresql table columns.
   * @param data
   * @returns
   */
  async createMany(
    data: Prisma.DatasourceElasticsearchIndexFieldCreateManyInput[]
  ) {
    const result =
      await this.prisma.datasourceElasticsearchIndexField.createMany({data});
    return result.count;
  }

  /**
   * Update a datasourcePostgresql table column
   *
   * @param {{
   *     where: Prisma.DatasourceElasticsearchIndexFieldWhereUniqueInput;
   *     data: Prisma.DatasourceElasticsearchIndexFieldUpdateInput;
   *   }} params
   * @returns {Promise<DatasourceElasticsearchIndexField>}
   * @memberof DatasourceElasticsearchIndexFieldService
   */
  async update(params: {
    where: Prisma.DatasourceElasticsearchIndexFieldWhereUniqueInput;
    data: Prisma.DatasourceElasticsearchIndexFieldUpdateInput;
  }): Promise<DatasourceElasticsearchIndexField> {
    const {where, data} = params;
    return await this.prisma.datasourceElasticsearchIndexField.update({
      data,
      where,
    });
  }

  /**
   * Delete a datasourcePostgresql table column
   *
   * @param {Prisma.DatasourceElasticsearchIndexFieldWhereUniqueInput} where
   * @returns {Promise<DatasourceElasticsearchIndexField>}
   * @memberof DatasourceElasticsearchIndexFieldService
   */
  async delete(
    where: Prisma.DatasourceElasticsearchIndexFieldWhereUniqueInput
  ): Promise<DatasourceElasticsearchIndexField> {
    return await this.prisma.datasourceElasticsearchIndexField.delete({
      where,
    });
  }

  async getIndices(datasourceId: string) {
    const indices = await this.elasticsearch.cat.indices({
      v: true, //If true, the response includes column headings. Defaults to false.
      health: 'green',
      format: 'json',
    });
    return indices;
  }

  async getAliases(datasourceId: string) {
    const aliases = await this.elasticsearch.cat.aliases({
      v: true,
      format: 'json',
    });
    return aliases;
  }

  async getMappings(datasourceId: string, indexName: string) {
    const mappings = await this.elasticsearch.indices.getMapping({
      index: indexName,
    });
    return mappings;
  }

  /* End */
}
