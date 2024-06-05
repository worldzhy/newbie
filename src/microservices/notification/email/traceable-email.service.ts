import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {AwsSqsService} from '@microservices/cloud/saas/aws/aws-sqs.service';

@Injectable()
export class TraceableEmailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly sqs: AwsSqsService
  ) {}

  async send(params: {toAddress: string; subject: string; content: string}) {
    const output = await this.sqs.sendMessage({
      queueUrl: this.configService.getOrThrow<string>(
        'microservices.traceableEmail.awsSqsQueueUrl'
      ),
      body: params,
    });
  }
}
