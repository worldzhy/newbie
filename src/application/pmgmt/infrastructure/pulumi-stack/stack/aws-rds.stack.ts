import {Injectable} from '@nestjs/common';
import * as aws from '@pulumi/aws';
import {getAwsConfig} from '../../../../../toolkit/aws/aws.config';
import {buildResourceOptions} from '../../../../../toolkit/utilities/pulumi.util';

@Injectable()
export class AwsRds_Stack {
  static getStackParams() {
    return {
      // Instance parameters
      instanceName: 'postgres-example',
      instanceType: 'db.t3.micro',
      allocatedStorage: 20,
      databaseName: 'postgres',
      username: 'postgres',
      password: 'postgres',
      // Network parameters
      vpcSubnetIds: ['subnet-01b5e1910ec7fd74c', 'subnet-0ab0381e937e9b3af'],
      isPublic: false,
    };
  }

  static checkStackParams(params: {}) {
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
    (params: {
      // Instance parameters
      instanceName: string;
      instanceType: string;
      allocatedStorage: number;
      databaseName: string;
      username: string;
      password: string;
      // Network parameters
      vpcSubnetIds: string[];
      isPublic: boolean;
    }) =>
    async () => {
      // [step 1] The subnet group specifies the VPC and subnets where the RDS will be deployed to.
      let uniqueResourceName = 'subnet-group';
      const subnetGroup = new aws.rds.SubnetGroup(uniqueResourceName, {
        subnetIds: params.vpcSubnetIds,
      });

      // [step 2] Create the RDS instance.
      uniqueResourceName = 'rds';
      const defaultInstance = new aws.rds.Instance(
        uniqueResourceName,
        {
          engine: 'postgres',
          identifier: params.instanceName,
          instanceClass: params.instanceType,
          allocatedStorage: params.allocatedStorage,
          name: params.databaseName,
          username: params.username,
          password: params.password,
          dbSubnetGroupName: subnetGroup.name,
          // RDS will use default security group(allow all traffic) if no vpcSecurityGroupIds provided.
          // vpcSecurityGroupIds: ['sg-xx', 'sg-yy'],
          publiclyAccessible: params.isPublic,
          skipFinalSnapshot: true, // 'finalSnapshotIdentifier' is required when 'skipFinalSnapshot' is false.
        },
        buildResourceOptions(getAwsConfig().region!)
      );

      return {
        databaseHost: defaultInstance.address,
        databasePort: defaultInstance.port,
      };
    };
}
