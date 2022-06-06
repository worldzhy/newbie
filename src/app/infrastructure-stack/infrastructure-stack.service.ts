import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../_prisma/_prisma.service';
import {PulumiService} from './pulumi/pulumi.service';
import {
  InfrastructureStack,
  InfrastructureStackManager,
  InfrastructureStackStatus,
  InfrastructureStackType,
  Prisma,
} from '@prisma/client';
import {CommonUtil} from 'src/_util/_common.util';

@Injectable()
export class InfrastructureStackService {
  private prisma = new PrismaService();
  private pulumiService = new PulumiService();
  private stackManager = InfrastructureStackManager.PULUMI;

  setAwsRegion(awsRegion: string) {
    this.pulumiService.setAwsRegion(awsRegion);
    return this;
  }

  async findOne(where: Prisma.InfrastructureStackWhereUniqueInput) {
    return await this.prisma.infrastructureStack.findUnique({
      where,
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
    stackParams: any
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
        upResult = await this.pulumiService.createStack(
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
      upResult = await this.pulumiService.createStack(
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
      destroyResult = await this.pulumiService.destroyStack(
        infrastructureStack.projectName,
        infrastructureStack.stackName,
        infrastructureStack.type,
        {}
      );

      deleteResult = await this.pulumiService.deleteStack(
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

  getStackParamsByType(stackType: InfrastructureStackType) {
    return {
      infrastructureStackParams:
        this.pulumiService.getStackParamsByType(stackType),
    };
  }
  /* End */
}
