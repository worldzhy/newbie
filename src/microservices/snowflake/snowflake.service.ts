import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {createPool} from 'snowflake-sdk';

@Injectable()
export class SnowflakeService {
  private connectionPool: {use: (arg0: (conn: any) => Promise<void>) => void};

  constructor(private readonly configService: ConfigService) {
    const config = this.configService.getOrThrow('microservices.snowflake');

    this.connectionPool = createPool(
      config.connectionOptions,
      config.poolOptions
    );
  }

  async execute(options: {sqlText: string; binds?: any[]}) {
    const f = async () => {
      return new Promise((resolve, reject) => {
        const _options = {
          ...options,
          complete: (err, statement, _rows: any) => {
            if (err) {
              reject(err);
            } else {
              resolve(_rows);
            }
          },
        };

        this.connectionPool.use(async conn => {
          conn.execute(_options);
        });
      });
    };

    return f();
  }
}
