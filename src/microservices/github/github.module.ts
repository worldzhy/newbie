import {Global, Module} from '@nestjs/common';
import {GitHubService} from './github.service';

@Global()
@Module({
  providers: [GitHubService],
  exports: [GitHubService],
})
export class GitHubModule {}
