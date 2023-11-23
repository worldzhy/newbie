import {Injectable} from '@nestjs/common';
import {SnowflakeService} from './snowflake.service';
import * as moment from 'moment';
import * as _ from 'lodash';

@Injectable()
export class StaffSfService {
  constructor(private readonly snowflakeService: SnowflakeService) {}

  async queryStaff(params) {
    const {email, studioId, locationId} = params;
    const sqlText = `
      select clientid,studioid,location
      from clients
      where emailname = ?
      and studioid = ?
      and location = ?    
    `;

    const executeOpt = {
      sqlText,
      binds: [email, studioId, locationId],
    };

    const data: any = await this.snowflakeService.execute(executeOpt);

    return {
      data,
      count: data.length,
    };
  }
}
