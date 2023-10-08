import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {createPool} from 'snowflake-sdk';

@Injectable()
export class SnowflakeService {
  private connPool: {use: (arg0: (conn: any) => Promise<void>) => void};

  constructor(private readonly configService: ConfigService) {
    if (!this.connPool) {
      const connectionOptions = this.configService.get('snowflake.connOption');
      const poolOptions = this.configService.get('snowflake.connOption');
      this.connPool = createPool(connectionOptions, poolOptions);
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

        this.connPool.use(async conn => {
          conn.execute(_executeOpt);
        });
      });
    };
    return waitPro();
  }
}
