import {Injectable} from '@nestjs/common';

@Injectable()
export class TraceableEmailService {
  constructor() {}

  async send(params: {toAddress: string; subject: string; content: string}) {}
}
