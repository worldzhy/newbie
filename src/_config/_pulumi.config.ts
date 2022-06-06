import {Injectable} from '@nestjs/common';
import {PrismaService} from 'src/_prisma/_prisma.service';
import {Enum} from './_common.enum';

@Injectable()
export class PulumiConfig {
  static getAwsVersion = () => {
    if (typeof process.env.PULUMI_AWS_VERSION === 'string') {
      return process.env.PULUMI_AWS_VERSION;
    } else {
      return 'environment variable PULUMI_AWS_VERSION is invalid.';
    }
  };

  static getAccessToken = () => {
    if (typeof process.env.PULUMI_ACCESS_TOKEN === 'string') {
      return process.env.PULUMI_ACCESS_TOKEN;
    } else {
      return 'environment variable PULUMI_ACCESS_TOKEN is invalid.';
    }
  };

  static getAwsRegion = async (projectName: string) => {
    const prisma = new PrismaService();
    const project = await prisma.project.findUnique({
      where: {name: projectName},
    });

    if (project) {
      return project.awsRegion;
    } else {
      return null;
    }
  };
}
