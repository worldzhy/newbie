import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../../_prisma/_prisma.service';
import {PulumiService} from './pulumi/pulumi.service';
import {CloudFormationService} from './cloudformation/cloudformation.service';
import {EnvironmentService} from '../environment/environment.service';
import {
  InfrastructureStack,
  InfrastructureStackManager,
  InfrastructureStackStatus,
  InfrastructureStackType,
  Prisma,
} from '@prisma/client';

@Injectable()
export class InfrastructureStackService {
  private prisma = new PrismaService();
  private pulumiService = new PulumiService();
  private cloudformationService = new CloudFormationService();
  private environmentService = new EnvironmentService();

  async findOne(where: Prisma.InfrastructureStackWhereUniqueInput) {
    return await this.prisma.infrastructureStack.findUnique({
      where,
    });
  }

  async findMany(where: Prisma.InfrastructureStackWhereInput) {
    return await this.prisma.infrastructureStack.findMany({where});
  }

  async create(
    data: Prisma.InfrastructureStackCreateInput
  ): Promise<InfrastructureStack | null> {
    return await this.prisma.infrastructureStack.create({
      data,
    });
  }

  async update(
    where: Prisma.InfrastructureStackWhereUniqueInput,
    data: Prisma.InfrastructureStackUpdateInput
  ) {
    // [step 1] Update database record of infrastructureStack.
    return await this.prisma.infrastructureStack.update({
      where,
      data,
    });
  }

  /**
   * Call this function if you don't know the input parameters of a infrastructure stack.
   *
   * @param {InfrastructureStackType} stackType
   * @returns
   * @memberof InfrastructureStackService
   */
  getStackParams(
    stackManager: InfrastructureStackManager,
    stackType: InfrastructureStackType
  ) {
    if (stackManager === InfrastructureStackManager.PULUMI) {
      return {
        type: stackType,
        params: this.pulumiService.getStackParams(stackType),
        manager: InfrastructureStackManager.PULUMI,
      };
    } else if (stackManager === InfrastructureStackManager.CLOUDFORMATION) {
      return {
        type: stackType,
        params: this.cloudformationService.getStackParams(stackType),
        manager: InfrastructureStackManager.CLOUDFORMATION,
      };
    }
  }

  /**
   *
   *
   * @param {InfrastructureStackType} stackType
   * @param {object} params
   * @returns
   * @memberof InfrastructureStackService
   */
  checkStackParams(
    stackManager: InfrastructureStackManager,
    stackType: InfrastructureStackType,
    params: any
  ) {
    if (stackManager === InfrastructureStackManager.PULUMI) {
      return this.pulumiService.checkStackParams(stackType, params);
    } else if (stackManager === InfrastructureStackManager.CLOUDFORMATION) {
      return this.cloudformationService.checkStackParams(stackType, params);
    }
  }

  /**
   * Attention:
   * This function must be called after 'InfrastructureStackService.setAwsRegion()'.
   *
   * @param {string} id
   * @returns
   * @memberof InfrastructureStackService
   */
  async build(id: string) {
    // [step 1] Update database record of infrastructureStack.
    const infrastructureStack = await this.prisma.infrastructureStack.update({
      where: {id},
      data: {
        status: InfrastructureStackStatus.BUILDING,
      },
    });

    // [step 2] Start launching infrastructureStack.
    const environment = await this.environmentService.findOne({
      type_projectId: {
        type: infrastructureStack.environment,
        projectId: infrastructureStack.projectId,
      },
    });
    if (
      !environment?.awsAccountId ||
      !environment.awsProfile ||
      !environment.awsRegion ||
      !environment.awsAccessKeyId ||
      !environment.awsSecretAccessKey
    ) {
      return {
        data: null,
        err: {
          message: 'Missing AWS profile or region.',
        },
      };
    }
    let buildResult: any = undefined;
    if (infrastructureStack.manager === InfrastructureStackManager.PULUMI) {
      buildResult = await this.pulumiService
        .setAwsAccountId(environment.awsAccountId)
        .setAwsProfile(environment.awsProfile)
        .setAwsRegion(environment.awsRegion)
        .setAwsAccessKey(environment.awsAccessKeyId)
        .setAwsSecretKey(environment.awsSecretAccessKey)
        .build(
          infrastructureStack.pulumiProjectName!,
          infrastructureStack.name,
          infrastructureStack.type,
          infrastructureStack.params
        );
    } else if (
      infrastructureStack.manager === InfrastructureStackManager.CLOUDFORMATION
    ) {
      buildResult = await this.cloudformationService
        .setAwsProfile(environment.awsProfile)
        .setAwsRegion(environment.awsRegion)
        .build(
          infrastructureStack.name,
          infrastructureStack.type,
          infrastructureStack.params
        );
    } else {
      return null;
    }

    // [step 3] Update database record of infrastructureStack.
    let stackStatus: InfrastructureStackStatus =
      InfrastructureStackStatus.BUILD_FAILED;
    if (buildResult.summary && buildResult.summary.result) {
      stackStatus =
        buildResult.summary.result === 'succeeded'
          ? InfrastructureStackStatus.BUILD_SUCCEEDED
          : InfrastructureStackStatus.BUILD_FAILED;
    }

    return await this.prisma.infrastructureStack.update({
      where: {id: infrastructureStack.id},
      data: {
        status: stackStatus,
        buildResult: buildResult,
      },
    });
  }

  /**
   * Destroy infrastructure stack.
   *
   * @param {string} id
   * @returns
   * @memberof InfrastructureStackService
   */
  async destroy(id: string) {
    // [step 1] Update database record of infrastructureStack.
    const infrastructureStack = await this.prisma.infrastructureStack.update({
      where: {id},
      data: {
        status: InfrastructureStackStatus.DESTROYING,
      },
    });

    // [step 2] Start destroying infrastructure stack.
    const environment = await this.environmentService.findOne({
      type_projectId: {
        type: infrastructureStack.environment,
        projectId: infrastructureStack.projectId,
      },
    });
    if (
      !environment?.awsProfile ||
      !environment.awsAccessKeyId ||
      !environment.awsSecretAccessKey ||
      !environment.awsRegion
    ) {
      return {
        data: null,
        err: {
          message: 'Missing AWS profile or region.',
        },
      };
    }
    let destroyResult: any = undefined;
    if (infrastructureStack.manager === InfrastructureStackManager.PULUMI) {
      destroyResult = await this.pulumiService.destroy(
        infrastructureStack.pulumiProjectName!,
        infrastructureStack.name
      );
    } else if (
      infrastructureStack.manager === InfrastructureStackManager.CLOUDFORMATION
    ) {
      destroyResult = await this.cloudformationService
        .setAwsProfile(environment.awsProfile)
        .setAwsRegion(environment.awsRegion)
        .destroy(infrastructureStack.name);
    } else {
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
        destroyResult: destroyResult,
      },
    });
  }

  /**
   * Delete infrastructure stack.
   *
   * @param {string} id
   * @returns
   * @memberof InfrastructureStackService
   */
  async delete(id: string) {
    // [step 1] Update database record of infrastructureStack.
    const infrastructureStack =
      await this.prisma.infrastructureStack.findUnique({
        where: {id},
      });

    // [step 2] Start destroying and deleting infrastructure stack.
    if (infrastructureStack === null) {
      return null;
    }
    if (infrastructureStack.manager === InfrastructureStackManager.PULUMI) {
      await this.pulumiService.delete(
        infrastructureStack.pulumiProjectName!,
        infrastructureStack.name
      );
    } /* else if (this.manager === InfrastructureManager.XXX) {
} */ else {
      return null;
    }

    // [step 3] Update database record of infrastructureStack.
    return await this.prisma.infrastructureStack.update({
      where: {id: infrastructureStack.id},
      data: {
        status: InfrastructureStackStatus.DELETED,
      },
    });
  }

  /* End */
}
