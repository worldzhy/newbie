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

  async executeAsync(executeOpt: {sqlText: string; binds?: any[]}) {
    const waitPro = async () => {
      return new Promise((resolve, reject) => {
        const _executeOpt = {
          ...executeOpt,
          complete: (err, statement, _rows: any) => {
            if (err) {
              reject(err);
            } else {
              resolve(_rows);
            }
          },
        };

        this.connectionPool.use(async conn => {
          conn.execute(_executeOpt);
        });
      });
    };
    return waitPro();
  }
}
