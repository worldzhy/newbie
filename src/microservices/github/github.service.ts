import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Octokit} from '@octokit/rest';

@Injectable()
export class GitHubService {
  private logger = new Logger(GitHubService.name);
  octokit: Octokit;

  constructor(private configService: ConfigService) {
    const config = this.configService.getOrThrow('microservices.github');
    if (config.auth)
      this.octokit = new Octokit({
        auth: config.auth,
        userAgent: config.userAgent ?? 'saas-starter',
      });
    else this.logger.warn('GitHub API key not found');
  }
}
