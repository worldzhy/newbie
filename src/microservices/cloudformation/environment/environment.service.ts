import {Injectable} from '@nestjs/common';
import {Prisma} from '@prisma/client';
import {PrismaService} from '@framework/prisma/prisma.service';
import {AwsSecretKeyTokenService} from '../token/secretkey-token.service';

@Injectable()
export class AwsEnvironmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly secretKeyTokenService: AwsSecretKeyTokenService
  ) {}

  async create(args: Prisma.AwsEnvironmentCreateArgs) {
    args.data.awsSecretAccessKey = this.secretKeyTokenService.sign(
      args.data.awsSecretAccessKey
    );

    return await this.prisma.awsEnvironment.create(args);
  }

  async update(args: Prisma.AwsEnvironmentUpdateArgs) {
    if (args.data.awsSecretAccessKey) {
      args.data.awsSecretAccessKey = this.secretKeyTokenService.sign(
        args.data.awsSecretAccessKey as string
      );
    }

    return await this.prisma.awsEnvironment.update(args);
  }
}
