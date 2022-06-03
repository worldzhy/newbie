import {rds} from '@pulumi/aws';

export const createDatabaseStack =
  (params: {
    instanceName: string;
    instanceType: string;
    allocatedStorage: number;
    databaseName: string;
    password: string;
    username: string;
  }) =>
  async () => {
    const defaultInstance = new rds.Instance(params.instanceName, {
      allocatedStorage: params.allocatedStorage,
      engine: 'postgres',
      instanceClass: params.instanceType,
      name: params.databaseName,
      password: params.password,
      username: params.username,
      vpcSecurityGroupIds: ['sg-08e3e67dfba148950'],
      skipFinalSnapshot: true, // 'finalSnapshotIdentifier' is required when 'skipFinalSnapshot' is false.
    });

    return {
      databaseHost: defaultInstance.address,
      databasePort: defaultInstance.port,
    };
  };
