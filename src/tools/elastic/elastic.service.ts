import {Injectable} from '@nestjs/common';
import {Client} from '@elastic/elasticsearch';
import {getElasticConfig} from '../../_config/_elastic.config';

@Injectable()
export class ElasticService extends Client {
  constructor() {
    const config = getElasticConfig();
    super({
      node: config.node,
      auth: {
        username: config.username!,
        password: config.password!,
      },
    });
  }
}
