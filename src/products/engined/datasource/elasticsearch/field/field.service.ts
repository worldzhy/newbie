import {Injectable} from '@nestjs/common';
import {ElasticsearchDatasourceIndexField, Prisma} from '@prisma/client';
import {PrismaService} from '../../../../../_prisma/_prisma.service';

@Injectable()
export class ElasticsearchDatasourceIndexFieldService {
  private prisma: PrismaService = new PrismaService();

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

  /* End */
}
