import {Client} from '@elastic/elasticsearch';
import {Index, Search} from '@elastic/elasticsearch/api/requestParams';
import {TransportRequestOptions} from '@elastic/elasticsearch/lib/Transport';
import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import createAwsElasticsearchConnector from 'aws-elasticsearch-connector';
import AWS from 'aws-sdk';
import PQueue from 'p-queue';
import pRetry from 'p-retry';

@Injectable()
export class ElasticsearchService {
  private logger = new Logger(ElasticsearchService.name);
  private queue = new PQueue({concurrency: 1});
  private client: Client;

  constructor(private configService: ConfigService) {
    const config = this.configService.getOrThrow(
      'microservices.saas-starter.elasticsearch'
    );
    if (config.aws?.accessKeyId) {
      AWS.config.update({
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
        region: config.aws.region,
      });
      this.client = new Client({
        ...createAwsElasticsearchConnector(AWS.config),
        node: config.node,
      });
    } else if (config.node)
      this.client = new Client({
        auth: config.auth,
        node: config.node,
      });
    else this.logger.warn('ElasticSearch tracking is not enabled');
  }

  async index(index: string, record: Record<string, any>, params?: Index) {
    if (this.client)
      this.queue
        .add(() =>
          pRetry(() => this.indexRecord(index, record, params), {
            retries:
              this.configService.get<number>(
                'microservices.saas-starter.elasticsearch.retries'
              ) ?? 3,
            onFailedAttempt: error => {
              this.logger.error(
                `Indexing record failed, retrying (${error.retriesLeft} attempts left)`,
                error.name
              );
            },
          })
        )
        .then(() => {})
        .catch(() => {});
  }

  async search(
    params?: Search<Record<string, any>>,
    options?: TransportRequestOptions
  ) {
    if (this.client) return this.client.search(params, options);
  }

  /**
   * Delete old records from ElasticSearch
   * @param index - Index
   * @param days - Number of days ago (e.g., 30 will delete month-old data)
   */
  async deleteOldRecords(index: string, days: number) {
    const now = new Date();
    now.setDate(now.getDate() - days);
    if (this.client)
      return this.client.deleteByQuery({
        index,
        body: {
          query: {
            bool: {
              must: [
                {
                  range: {
                    date: {
                      lte: now,
                    },
                  },
                },
              ],
            },
          },
        },
      });
  }

  private async indexRecord(
    index: string,
    record: Record<string, any>,
    params?: Index
  ) {
    return this.client.index({index, body: record, ...params});
  }
}
