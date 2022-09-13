import {Injectable} from '@nestjs/common';
import {Client} from '@elastic/elasticsearch';
import {getElasticsearchConfig} from '../_config/_elastic.config';

@Injectable()
export class ElasticsearchService extends Client {
  constructor() {
    const config = getElasticsearchConfig();
    super({
      node: config.node,
      auth: {
        username: config.username!,
        password: config.password!,
      },
    });
  }
}
