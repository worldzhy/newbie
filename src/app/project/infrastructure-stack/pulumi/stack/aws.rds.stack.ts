import {Injectable} from '@nestjs/common';
import * as aws from '@pulumi/aws';
import {PulumiUtil} from '../pulumi.util';

@Injectable()
export class AwsRds_Stack {
  static getStackParams() {
    return {
      instanceName: 'postgres-default',
      instanceType: 'db.t3.micro',
      allocatedStorage: 20,
      databaseName: 'postgres',
      username: 'postgres',
      password: 'postgres',
    };
  }

  static checkStackParams(params: object) {
    if (params) {
      return true;
    } else {
      return false;
    }
  }

  static getStackOutputKeys() {
    return ['databaseHost', 'databasePort'];
  }

  static getStackProgram =
    (
      params: {
        instanceName: string;
        instanceType: string;
        allocatedStorage: number;
        databaseName: string;
        password: string;
        username: string;
      },
      awsRegion: string
    ) =>
    async () => {
      const uniqueResourceName = 'rds';
      const defaultInstance = new aws.rds.Instance(
        uniqueResourceName,
        {
          identifier: params.instanceName,
          allocatedStorage: params.allocatedStorage,
          engine: 'postgres',
          instanceClass: params.instanceType,
          name: params.databaseName,
          password: params.password,
          username: params.username,
          vpcSecurityGroupIds: ['sg-08e3e67dfba148950'],
          skipFinalSnapshot: true, // 'finalSnapshotIdentifier' is required when 'skipFinalSnapshot' is false.
        },
        PulumiUtil.getResourceOptions(awsRegion)
      );

      return {
        databaseHost: defaultInstance.address,
        databasePort: defaultInstance.port,
      };
    };
}
