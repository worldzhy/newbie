import {Injectable} from '@nestjs/common';
import {BaseProgram} from './base.program';
import {rds} from '@pulumi/aws';

@Injectable()
export class Database extends BaseProgram {
  private instanceName: string = 'postgres-default';
  private instanceType: string = 'db.t3.micro';
  private allocatedStorage: number = 20;
  private databaseName: string = 'postgres';
  private username: string = 'postgres';
  private password: string = 'postgres';

  constructor() {
    super();
    this.initPulumiProgram(this.program);
  }

  setInstanceName = (instanceName: string) => {
    this.instanceName = instanceName + '-';
    return this;
  };

  setInstanceType = (instanceType: string) => {
    this.instanceType = instanceType;
    return this;
  };

  /**
   * (Minimum: 20 GiB. Maximum: 65,536 GiB) Higher allocated storage can improve IOPS performance.
   *
   * @memberof InfraDatabaseService
   */
  setAllocatedStorage = (allocatedStorage: number) => {
    this.allocatedStorage = allocatedStorage;
    return this;
  };

  setDatabaseName = (databaseName: string) => {
    this.databaseName = databaseName;
    return this;
  };

  setUsername = (username: string) => {
    this.username = username;
    return this;
  };

  setPassword = (password: string) => {
    this.password = password;
    return this;
  };

  program = async () => {
    const defaultInstance = new rds.Instance(this.instanceName, {
      allocatedStorage: this.allocatedStorage,
      engine: 'postgres',
      instanceClass: this.instanceType,
      name: this.databaseName,
      password: this.password,
      username: this.username,
      vpcSecurityGroupIds: ['sg-08e3e67dfba148950'],
      skipFinalSnapshot: true, // 'finalSnapshotIdentifier' is required when 'skipFinalSnapshot' is false.
    });

    return {
      databaseHost: defaultInstance.address,
      databasePort: defaultInstance.port,
    };
  };

  /* End */
}
