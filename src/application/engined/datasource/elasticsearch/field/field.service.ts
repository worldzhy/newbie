import {Injectable} from '@nestjs/common';
import {ElasticsearchDatasourceIndexField, Prisma} from '@prisma/client';
import {PrismaService} from '../../../../../toolkits/prisma/prisma.service';

@Injectable()
export class ElasticsearchDatasourceIndexFieldService {
  private prisma: PrismaService = new PrismaService();

  async findUnique(
    params: Prisma.ElasticsearchDatasourceIndexFieldFindUniqueArgs
  ): Promise<ElasticsearchDatasourceIndexField | null> {
    return await this.prisma.elasticsearchDatasourceIndexField.findUnique(
      params
    );
  }

  async findMany(
    params: Prisma.ElasticsearchDatasourceIndexFieldFindManyArgs
  ): Promise<ElasticsearchDatasourceIndexField[]> {
    return await this.prisma.elasticsearchDatasourceIndexField.findMany(params);
  }

  async create(
    params: Prisma.ElasticsearchDatasourceIndexFieldCreateArgs
  ): Promise<ElasticsearchDatasourceIndexField> {
    // [middleware] The indexId from HTTP request is string type. Convert it to number type.
    this.prisma.$use(async (params, next) => {
      if (params.model === 'ElasticsearchDatasourceIndexField') {
        if (params.action === 'create') {
          if (
            params.args['data']['indexId'] &&
            typeof params.args['data']['indexId'] === 'string'
          ) {
            params.args['data']['indexId'] = parseInt(
              params.args['data']['indexId']
            );
          }
        }
      }
      return next(params);
    });

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
