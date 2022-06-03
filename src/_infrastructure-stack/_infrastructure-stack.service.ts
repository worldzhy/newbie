import {Injectable} from '@nestjs/common';
import {PrismaService} from '../_prisma/_prisma.service';
import {PulumiService} from './_pulumi/_pulumi.service';
import {
  InfrastructureStack,
  InfrastructureStackManager,
  InfrastructureStackStatus,
  InfrastructureStackType,
} from '@prisma/client';
import {CommonUtil} from 'src/_util/_common.util';

@Injectable()
export class InfrastructureStackService {
  private prisma = new PrismaService();
  private pulumi = new PulumiService();
  private stackManager = InfrastructureStackManager.PULUMI;

  async findOne(id: string) {
    return await this.prisma.infrastructureStack.findUnique({
      where: {id},
    });
  }

  async findMany(projectName: string) {
    return await this.prisma.infrastructureStack.findMany({
      where: {projectName},
    });
  }

  async create(
    projectName: string,
    stackType: InfrastructureStackType,
    stackParams: object
  ): Promise<InfrastructureStack | null> {
    // [step 1] Create a database record of infrastructureStack.
    const stackName = stackType + '-' + CommonUtil.randomCode(8);
    const infrastructureStack = await this.prisma.infrastructureStack.create({
      data: {
        manager: this.stackManager,
        type: stackType,
        status: InfrastructureStackStatus.CREATING,
        projectName: projectName,
        stackName: stackName,
      },
    });

    try {
      // [step 2] Start launching infrastructureStack.
      let upResult: any = undefined;
      if (this.stackManager === InfrastructureStackManager.PULUMI) {
        upResult = await this.pulumi.createStack(
          projectName,
          stackName,
          stackType,
          stackParams
        );
      } // else if (this.manager === InfrastructureManager.XXX) {}
      else {
        return null;
      }

      // [step 3] Update database record of infrastructureStack.
      return await this.prisma.infrastructureStack.update({
        where: {id: infrastructureStack.id},
        data: {
          status:
            upResult.summary.result === 'succeeded'
              ? InfrastructureStackStatus.CREATE_SUCCEEDED
              : InfrastructureStackStatus.CREATE_FAILED,
          stackResult: upResult,
        },
      });
    } catch (error) {
      // [step 3 - exception] Update database record of infrastructureStack.
      return await this.prisma.infrastructureStack.update({
        where: {id: infrastructureStack.id},
        data: {
          status: InfrastructureStackStatus.CREATE_FAILED,
          stackResult: error,
        },
      });
    }
  }

  async update(id: string, params: any) {
    // [step 1] Update database record of infrastructureStack.
    const infrastructureStack = await this.prisma.infrastructureStack.update({
      where: {id},
      data: {
        status: InfrastructureStackStatus.UPDATING,
      },
    });

    // [step 2] Start launching infrastructureStack.
    if (infrastructureStack === null) {
      return null;
    }
    let upResult;
    if (this.stackManager === InfrastructureStackManager.PULUMI) {
      upResult = await this.pulumi.createStack(
        infrastructureStack.projectName,
        infrastructureStack.stackName,
        infrastructureStack.type,
        params
      );
    } /* else if (this.manager === InfrastructureManager.XXX) {
    } */ else {
      return null;
    }

    // [step 3] Update database record of infrastructureStack.
    return await this.prisma.infrastructureStack.update({
      where: {id: infrastructureStack.id},
      data: {
        status:
          upResult.summary.result === 'succeeded'
            ? InfrastructureStackStatus.UPDATE_SUCCEEDED
            : InfrastructureStackStatus.UPDATE_FAILED,
        stackResult: upResult,
      },
    });
  }

  /**
   * Destroy and delete infrastructure stack.
   *
   * @param {string} id
   * @returns
   * @memberof InfrastructureStackService
   */
  async destroyAndDelete(id: string) {
    // [step 1] Update database record of infrastructureStack.
    const infrastructureStack = await this.prisma.infrastructureStack.update({
      where: {id},
      data: {
        status: InfrastructureStackStatus.DESTROYING,
      },
    });

    // [step 2] Start destroying and deleting infrastructure stack.
    if (infrastructureStack === null) {
      return null;
    }
    let destroyResult, deleteResult;
    if (this.stackManager === InfrastructureStackManager.PULUMI) {
      destroyResult = await this.pulumi.destroyStack(
        infrastructureStack.projectName,
        infrastructureStack.stackName,
        infrastructureStack.type,
        {}
      );

      deleteResult = await this.pulumi.deleteStack(
        infrastructureStack.projectName,
        infrastructureStack.stackName,
        infrastructureStack.type
      );
    } /* else if (this.manager === InfrastructureManager.XXX) {
} */ else {
      return null;
    }

    // [step 3] Update database record of infrastructureStack.
    return await this.prisma.infrastructureStack.update({
      where: {id: infrastructureStack.id},
      data: {
        status:
          destroyResult.summary.result === 'succeeded'
            ? InfrastructureStackStatus.DESTROY_SUCCEEDED
            : InfrastructureStackStatus.DESTROY_FAILED,
        stackResult: {destroyResult, deleteResult},
      },
    });
  }

  /**
   * Get stack params by type.
   *
   * @param {InfrastructureStackType} type
   * @returns
   * @memberof InfrastructureStackService
   */
  getParamsByType(type: InfrastructureStackType) {
    switch (type) {
      case InfrastructureStackType.AWS_VPC:
        return {
          vpcName: 'pulumi-test-vpc',
          vpcCidrBlock: '10.21.0.0/16',
        };
      case InfrastructureStackType.ACCOUNT:
        return {};
      case InfrastructureStackType.DATABASE:
        return {
          instanceName: 'postgres-default',
          instanceType: 'db.t3.micro',
          allocatedStorage: 20,
          databaseName: 'postgres',
          username: 'postgres',
          password: 'postgres',
        };
      case InfrastructureStackType.ELASTIC_CONTAINER_CLUSTER:
        return {
          vpcId: 'vpc-086e9a2695d4f7001',
          clusterName: 'development',
          repositoryName: 'nodejs',
          desiredTaskCount: 5,
        };
      case InfrastructureStackType.ELASTIC_SERVER_CLUSTER:
        return {};
      case InfrastructureStackType.FILE_MANAGER:
        return {bucketName: 'default-bucket-name'};
      case InfrastructureStackType.LOGGER:
        return {};
      case InfrastructureStackType.NETWORK:
        return {
          [InfrastructureStackType.ELASTIC_CONTAINER_CLUSTER]: {
            vpcName: 'elastic-container-cluster',
            vpcCidrBlock: '10.10.0.0/16',
            numberOfAvailabilityZones: 2,
          },
          [InfrastructureStackType.ELASTIC_SERVER_CLUSTER]: {
            vpcName: 'elastic-server-cluster',
            vpcCidrBlock: '10.20.0.0/16',
            numberOfAvailabilityZones: 2,
          },
        };
      case InfrastructureStackType.QUEQUE:
        return {};
      default:
        return {message: 'Invalid infrastructureStack stack type.'};
    }
  }

  /* End */
}
