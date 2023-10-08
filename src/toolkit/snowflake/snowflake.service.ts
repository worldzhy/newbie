import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {createPool} from 'snowflake-sdk';

@Injectable()
export class SnowflakeService {
  private connectionPool: {use: (arg0: (conn: any) => Promise<void>) => void};

  constructor(private readonly configService: ConfigService) {
    if (!this.connectionPool) {
      const connectionOptions = this.configService.get(
        'toolkit.snowflake.connectionOption'
      );
      const poolOptions = this.configService.get(
        'toolkit.snowflake.poolOption'
      );
      this.connectionPool = createPool(connectionOptions, poolOptions);
    }
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
