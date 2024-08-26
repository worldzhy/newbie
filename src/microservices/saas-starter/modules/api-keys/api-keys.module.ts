import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {ElasticsearchModule} from '../../providers/elasticsearch/elasticsearch.module';

import {TokensModule} from '../../providers/tokens/tokens.module';
import {ApiKeyGroupController} from './api-keys-group.controller';
import {ApiKeyUserController} from './api-keys-user.controller';
import {ApiKeysService} from './api-keys.service';

@Module({
  imports: [TokensModule, ConfigModule, ElasticsearchModule],
  controllers: [ApiKeyGroupController, ApiKeyUserController],
  providers: [ApiKeysService],
  exports: [ApiKeysService],
})
export class ApiKeysModule {}
