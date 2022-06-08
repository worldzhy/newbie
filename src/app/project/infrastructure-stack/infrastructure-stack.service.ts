import {Injectable} from '@nestjs/common';
import {PrismaService} from '../../../_prisma/_prisma.service';
import {PulumiService} from './pulumi/pulumi.service';
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
  private stackManager = InfrastructureStackManager.PULUMI;

  /**
   * Call this function if you don't know the input parameters of a infrastructure stack.
   *
   * @param {InfrastructureStackType} stackType
   * @returns
   * @memberof InfrastructureStackService
   */
  getStackParams(stackType: InfrastructureStackType) {
    return {
      params: this.pulumiService.getStackParams(stackType),
    };
  }

  /**
   *
   *
   * @param {InfrastructureStackType} stackType
   * @param {object} params
   * @returns
   * @memberof InfrastructureStackService
   */
  checkStackParams(stackType: InfrastructureStackType, params: any) {
    return this.pulumiService.checkStackParams(stackType, params);
  }

  /**
   * Attention:
   * This function must be called before 'InfrastructureStackService.create()'.
   *
   * @param {string} awsRegion
   * @returns
   * @memberof InfrastructureStackService
   */
  setAwsRegion(awsRegion: string) {
    this.pulumiService.setAwsRegion(awsRegion);
    return this;
  }

  async findOne(where: Prisma.InfrastructureStackWhereUniqueInput) {
    return await this.prisma.infrastructureStack.findUnique({
      where,
    });
  }

  async findOneWithStackOutputs(
    where: Prisma.InfrastructureStackWhereUniqueInput
  ) {
    const stack = await this.prisma.infrastructureStack.findUnique({
      where,
    });
    if (stack === null) {
      return null;
    }

    const outputs = await this.pulumiService.getStackOutputs(
      stack.pulumiProjectName,
      stack.name,
      stack.type
    );

    return {
      stack: stack,
      outputs: outputs,
    };
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
    let upResult: any = undefined;
    if (this.stackManager === InfrastructureStackManager.PULUMI) {
      upResult = await this.pulumiService.build(
        infrastructureStack.pulumiProjectName,
        infrastructureStack.name,
        infrastructureStack.type,
        infrastructureStack.params
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
            ? InfrastructureStackStatus.BUILD_SUCCEEDED
            : InfrastructureStackStatus.BUILD_FAILED,
        upResult: upResult,
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
    if (infrastructureStack === null) {
      return null;
    }
    let destroyResult;
    if (this.stackManager === InfrastructureStackManager.PULUMI) {
      destroyResult = await this.pulumiService.destroy(
        infrastructureStack.pulumiProjectName,
        infrastructureStack.name,
        infrastructureStack.type,
        {}
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
    let deleteResult;
    if (this.stackManager === InfrastructureStackManager.PULUMI) {
      deleteResult = await this.pulumiService.delete(
        infrastructureStack.pulumiProjectName,
        infrastructureStack.name,
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
        status: InfrastructureStackStatus.DELETED,
        deleteResult: deleteResult,
      },
    });
  }

  /* End */
}
