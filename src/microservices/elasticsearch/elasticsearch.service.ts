import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Client} from '@elastic/elasticsearch';
import {Index, Search} from '@elastic/elasticsearch/api/requestParams';
import {TransportRequestOptions} from '@elastic/elasticsearch/lib/Transport';
import PQueue from 'p-queue';
import pRetry from 'p-retry';

@Injectable()
export class ElasticsearchService {
  private logger = new Logger('Elasticsearch');
  private queue = new PQueue({concurrency: 1});
  private client: Client;

  constructor(private readonly configService: ConfigService) {
    const config = this.configService.getOrThrow('microservices.elasticsearch');

    this.client = new Client({
      node: config.node,
      auth: {
        username: config.username,
        password: config.password,
      },
    });
  }

  async index(index: string, record: Record<string, any>, params?: Index) {
    if (this.client)
      this.queue
        .add(() =>
          pRetry(() => this.indexRecord(index, record, params), {
            retries:
              this.configService.get<number>(
                'microservices.elasticsearch.retries'
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
