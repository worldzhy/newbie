import {Injectable} from '@nestjs/common';
import {Database} from './code/rds.stack';
import {ElasticContainerCluster} from './code/ecs.stack';
import {ElasticServerCluster} from './code/eks.stack';
import {FileManager} from './code/s3.stack';
import {Network} from './code/vpc.stack';
import {Config} from '../../_common/_common.config';
import {PulumiStackType} from '@prisma/client';
import axios from 'axios';

@Injectable()
export class InfrastructureService {
  private ecsStack = new ElasticContainerCluster();
  private eksStack = new ElasticServerCluster();
  private fileManagerStack = new FileManager();
  private databaseStack = new Database();
  private networkStack = new Network();

  /**
   * See the detail https://www.pulumi.com/docs/reference/service-rest-api/#list-stacks
   *
   * @returns
   * @memberof InfrastructureService
   */
  async listStacks() {
    const url = 'https://api.pulumi.com/api/user/stacks';
    return await axios.get(url, {
      maxRedirects: 5,
      headers: {
        Accept: 'application/vnd.pulumi+8',
        'Content-Type': 'application/json',
        Authorization: 'token ' + Config.getPulumiAccessToken(),
      },
    });
  }

  /**
   * See the detail https://www.pulumi.com/docs/reference/service-rest-api/#get-stack
   * @param {string} pulumiOrgName
   * @param {string} pulumiStackType
   * @param {string} pulumiStackName
   * @returns
   * @memberof InfrastructureService
   */
  async getStack(
    pulumiOrgName: string,
    pulumiStackType: string,
    pulumiStackName: string
  ) {
    const url = `https://api.pulumi.com/api/stacks/${pulumiOrgName}/${pulumiStackType}/${pulumiStackName}`;
    return await axios.get(url, {
      maxRedirects: 5,
      headers: {
        Accept: 'application/vnd.pulumi+8',
        'Content-Type': 'application/json',
        Authorization: 'token ' + Config.getPulumiAccessToken(),
      },
    });
  }

  /**
   * See the detail https://www.pulumi.com/docs/reference/service-rest-api/#get-stack-state
   *
   * @param {string} pulumiOrgName
   * @param {string} pulumiStackType
   * @param {string} pulumiStackName
   * @returns
   * @memberof InfrastructureService
   */
  async getStackState(
    pulumiOrgName: string,
    pulumiStackType: string,
    pulumiStackName: string
  ) {
    const url = `https://api.pulumi.com/api/stacks/${pulumiOrgName}/${pulumiStackType}/${pulumiStackName}/export`;
    return await axios.get(url, {
      maxRedirects: 5,
      headers: {
        Accept: 'application/vnd.pulumi+8',
        'Content-Type': 'application/json',
        Authorization: 'token ' + Config.getPulumiAccessToken(),
      },
    });
  }

  /**
   * Start Pulumi stack
   *
   * @param {string} stackType
   * @param {string} stackName
   * @param {*} stackParams
   * @returns
   * @memberof InfrastructureService
   */
  async startStack(stackType: string, stackName: string, stackParams: any) {
    switch (stackType) {
      case PulumiStackType.DATABASE:
        return await this.databaseStack.setStackName(stackName).start();
      case PulumiStackType.ELASTIC_CONTAINER_CLUSTER:
        return await this.ecsStack
          .setStackName(stackName)
          .setVpcId(stackParams.vpcId as string | null)
          .setClusterName(stackParams.clusterName as string | null)
          .setRepositoryName(stackParams.repositoryName as string | null)
          .setDesiredTaskCount(stackParams.desiredTaskCount as number | null)
          .start();
      case PulumiStackType.ELASTIC_SERVER_CLUSTER:
        return await this.eksStack.setStackName(stackName).start();
      case PulumiStackType.FILE_MANAGER:
        return await this.fileManagerStack.setStackName(stackName).start();
      case PulumiStackType.NETWORK:
        return await this.networkStack.setStackName(stackName).start();
      default:
        break;
    }
  }

  /**
   * Destroy Pulumi stack
   *
   * @param {string} stackType
   * @param {string} stackName
   * @returns
   * @memberof InfrastructureService
   */
  async destroyStack(stackType: string, stackName: string) {
    switch (stackType) {
      case PulumiStackType.DATABASE:
        return await this.databaseStack.setStackName(stackName).destroy();
      case PulumiStackType.ELASTIC_CONTAINER_CLUSTER:
        return await this.ecsStack.setStackName(stackName).destroy();
      case PulumiStackType.ELASTIC_SERVER_CLUSTER:
        return await this.eksStack.setStackName(stackName).destroy();
      case PulumiStackType.FILE_MANAGER:
        return await this.fileManagerStack.setStackName(stackName).destroy();
      case PulumiStackType.NETWORK:
        return await this.networkStack.setStackName(stackName).destroy();
      default:
        return {err: {message: 'Invalid stack type.'}};
    }
  }

  /**
   * See the detail https://www.pulumi.com/docs/reference/service-rest-api/#delete-stack
   *
   * @param {string} pulumiOrgName
   * @param {string} stackType
   * @param {string} stackName
   * @returns
   * @memberof InfrastructureService
   */
  async deleteStack(
    pulumiOrgName: string,
    stackType: string,
    stackName: string
  ) {
    let pulumiStackType: string;
    switch (stackType) {
      case PulumiStackType.DATABASE:
        pulumiStackType = this.databaseStack.constructor.name;
        break;
      case PulumiStackType.ELASTIC_CONTAINER_CLUSTER:
        pulumiStackType = this.ecsStack.constructor.name;
        break;
      case PulumiStackType.ELASTIC_SERVER_CLUSTER:
        pulumiStackType = this.eksStack.constructor.name;
        break;
      case PulumiStackType.FILE_MANAGER:
        pulumiStackType = this.fileManagerStack.constructor.name;
        break;
      case PulumiStackType.NETWORK:
        pulumiStackType = this.networkStack.constructor.name;
        break;
      default:
        return {err: {message: 'Invalid stack type.'}};
    }

    const url = `https://api.pulumi.com/api/stacks/${pulumiOrgName}/${pulumiStackType}/${stackName}`;
    try {
      const response = await axios.delete(url, {
        maxRedirects: 5,
        headers: {
          Accept: 'application/vnd.pulumi+8',
          'Content-Type': 'application/json',
          Authorization: 'token ' + Config.getPulumiAccessToken(),
        },
      });

      return {
        status: response.status,
        statusText: response.statusText,
        config: response.config,
        data: response.data,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(error);
      } else {
        console.error(error);
      }
    }
  }

  getParamsByStackType(stackType: string) {
    switch (stackType) {
      case PulumiStackType.ACCOUNT:
        return {};
      case PulumiStackType.DATABASE:
        return {
          instanceName: 'postgres-default',
          instanceClass: 'db.t3.micro',
          allocatedStorage: 20,
          databaseName: 'postgres',
          username: 'postgres',
          password: 'postgres',
        };
      case PulumiStackType.ELASTIC_CONTAINER_CLUSTER:
        return {
          vpcId: 'vpc-0480013368552dacb',
          clusterName: 'my-cluster',
          repositoryName: 'nodejs',
          desiredTaskCount: 5,
        };
      case PulumiStackType.ELASTIC_SERVER_CLUSTER:
        return {};
      case PulumiStackType.FILE_MANAGER:
        return {};
      case PulumiStackType.LOGGER:
        return {};
      case PulumiStackType.NETWORK:
        return {
          [PulumiStackType.ELASTIC_CONTAINER_CLUSTER]: {},
          [PulumiStackType.ELASTIC_SERVER_CLUSTER]: {},
        };
      case PulumiStackType.QUEQUE:
        return {};
      default:
        return {message: 'Invalid infrastructure stack type.'};
    }
  }
  /* End */
}
