import {Injectable} from '@nestjs/common';
import {
  ElasticsearchDatasource,
  ElasticsearchDatasourceIndexField,
  Prisma,
} from '@prisma/client';
import {ElasticsearchService} from 'src/_elasticsearch/_elasticsearch.service';
import {PrismaService} from '../../../../_prisma/_prisma.service';

@Injectable()
export class ElasticsearchDatasourceIndexFieldService {
  private prisma: PrismaService = new PrismaService();
  private elasticsearch: ElasticsearchService = new ElasticsearchService();

  /**
   * Generate the table relations of the schema.
   * @param datasource
   * @returns
   */
  async extract(datasource: ElasticsearchDatasource) {
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
   * Get a postgresqlDatasource table column
   * @param {Prisma.ElasticsearchDatasourceIndexFieldWhereUniqueInput} where
   * @returns {(Promise<ElasticsearchDatasourceIndexField | null>)}
   * @memberof ElasticsearchDatasourceIndexFieldService
   */
  async findOne(
    where: Prisma.ElasticsearchDatasourceIndexFieldWhereUniqueInput
  ): Promise<ElasticsearchDatasourceIndexField | null> {
    return await this.prisma.elasticsearchDatasourceIndexField.findUnique({
      where,
    });
  }

  /**
   * Get many postgresqlDatasource table columns
   *
   * @param {{
   *     skip?: number;
   *     take?: number;
   *     where?: Prisma.ElasticsearchDatasourceIndexFieldWhereInput;
   *     orderBy?: Prisma.ElasticsearchDatasourceIndexFieldOrderByWithRelationAndSearchRelevanceInput;
   *     select?: Prisma.ElasticsearchDatasourceIndexFieldSelect;
   *   }} params
   * @returns
   * @memberof ElasticsearchDatasourceIndexFieldService
   */
  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ElasticsearchDatasourceIndexFieldWhereInput;
    orderBy?: Prisma.ElasticsearchDatasourceIndexFieldOrderByWithRelationAndSearchRelevanceInput;
    select?: Prisma.ElasticsearchDatasourceIndexFieldSelect;
  }) {
    const {skip, take, where, orderBy, select} = params;

    return await this.prisma.elasticsearchDatasourceIndexField.findMany({
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
    by: Prisma.ElasticsearchDatasourceIndexFieldScalarFieldEnum[];
    where: Prisma.ElasticsearchDatasourceIndexFieldWhereInput;
    orderBy?: Prisma.ElasticsearchDatasourceIndexFieldOrderByWithAggregationInput;
  }) {
    return await this.prisma.elasticsearchDatasourceIndexField.groupBy(params);
  }

  /**
   * Create a postgresqlDatasource table column
   *
   * @param {Prisma.ElasticsearchDatasourceIndexFieldCreateInput} data
   * @returns {Promise<ElasticsearchDatasourceIndexField>}
   * @memberof ElasticsearchDatasourceIndexFieldService
   */
  async create(
    data: Prisma.ElasticsearchDatasourceIndexFieldCreateInput
  ): Promise<ElasticsearchDatasourceIndexField> {
    return await this.prisma.elasticsearchDatasourceIndexField.create({
      data,
    });
  }

  /**
   * Create many postgresqlDatasource table columns.
   * @param data
   * @returns
   */
  async createMany(
    data: Prisma.ElasticsearchDatasourceIndexFieldCreateManyInput[]
  ) {
    const result =
      await this.prisma.elasticsearchDatasourceIndexField.createMany({data});
    return result.count;
  }

  /**
   * Update a postgresqlDatasource table column
   *
   * @param {{
   *     where: Prisma.ElasticsearchDatasourceIndexFieldWhereUniqueInput;
   *     data: Prisma.ElasticsearchDatasourceIndexFieldUpdateInput;
   *   }} params
   * @returns {Promise<ElasticsearchDatasourceIndexField>}
   * @memberof ElasticsearchDatasourceIndexFieldService
   */
  async update(params: {
    where: Prisma.ElasticsearchDatasourceIndexFieldWhereUniqueInput;
    data: Prisma.ElasticsearchDatasourceIndexFieldUpdateInput;
  }): Promise<ElasticsearchDatasourceIndexField> {
    const {where, data} = params;
    return await this.prisma.elasticsearchDatasourceIndexField.update({
      data,
      where,
    });
  }

  /**
   * Delete a postgresqlDatasource table column
   *
   * @param {Prisma.ElasticsearchDatasourceIndexFieldWhereUniqueInput} where
   * @returns {Promise<ElasticsearchDatasourceIndexField>}
   * @memberof ElasticsearchDatasourceIndexFieldService
   */
  async delete(
    where: Prisma.ElasticsearchDatasourceIndexFieldWhereUniqueInput
  ): Promise<ElasticsearchDatasourceIndexField> {
    return await this.prisma.elasticsearchDatasourceIndexField.delete({
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
