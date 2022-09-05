import {Injectable} from '@nestjs/common';
import {Client} from '@elastic/elasticsearch';
import {ElasticsearchConfig} from '../_config/_elasticsearch.config';

@Injectable()
export class ElasticsearchService extends Client {
  constructor() {
    super({
      node: ElasticsearchConfig.getNode(),
      auth: {
        username: ElasticsearchConfig.getUsername(),
        password: ElasticsearchConfig.getPassword(),
      },
    });
  }
}
