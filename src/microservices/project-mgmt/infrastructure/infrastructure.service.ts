import {
  CreateStackCommandOutput,
  DeleteStackCommandOutput,
} from '@aws-sdk/client-cloudformation';
import {BadRequestException, Injectable} from '@nestjs/common';
import {
  InfrastructureStack,
  InfrastructureStackManager,
  InfrastructureStackState,
} from '@prisma/client';
import {DestroyResult, UpResult} from '@pulumi/pulumi/automation';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {
  CloudFormationStackService,
  CloudFormationStackType,
} from './cloudformation/cloudformation.service';
import {PulumiStackService, PulumiStackType} from './pulumi/pulumi.service';

@Injectable()
export class InfrastructureService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudformationStackService: CloudFormationStackService,
    private readonly pulumiStackService: PulumiStackService
  ) {}

  listManagers() {
    return Object.values(InfrastructureStackManager);
  }

  listStackTypes(manager: string) {
    if (manager === InfrastructureStackManager.CloudFormation) {
      return Object.values(CloudFormationStackType);
    } else if (manager === InfrastructureStackManager.Pulumi) {
      return Object.values(PulumiStackType);
    } else {
      throw new BadRequestException('The infrastructure manager is invalid.');
    }
  }

  getStackParams(params: {manager: string; type: string}) {
    if (params.manager === InfrastructureStackManager.CloudFormation) {
      return this.cloudformationStackService.getStackParams(params.type);
    } else if (params.manager === InfrastructureStackManager.Pulumi) {
      return this.pulumiStackService.getStackParams(params.type);
    } else {
      throw new BadRequestException('The infrastructure manager is invalid.');
    }
  }

  async createStack(stackId: string): Promise<InfrastructureStack> {
    // [step 1] Get the infrastructure stack.
    const stack = await this.prisma.infrastructureStack.findUniqueOrThrow({
      where: {id: stackId},
      include: {environment: {include: {project: true}}},
    });

    if (
      stack.state !== InfrastructureStackState.PENDING &&
      stack.state !== InfrastructureStackState.DESTROY_SUCCEEDED
    ) {
      throw new BadRequestException('The infrastructure has been built.');
    }

    // [step 2] Build the infrastructure stack.
    let output: CreateStackCommandOutput | UpResult;
    let state: InfrastructureStackState;
    if (stack.manager === InfrastructureStackManager.CloudFormation) {
      if (
        false ===
        this.cloudformationStackService.checkStackParams({
          stackType: stack.type,
          stackParams: stack.params as object,
        })
      ) {
        throw new BadRequestException(
          'This infrastructure stack parameters are not ready.'
        );
      }

      output = await this.cloudformationStackService.createResources(stack);
      state = InfrastructureStackState.BUILD_PROCESSING;
    } else if (stack.manager === InfrastructureStackManager.Pulumi) {
      if (
        false ===
        this.pulumiStackService.checkStackParams({
          stackType: stack.type,
          stackParams: stack.params as object,
        })
      ) {
        throw new BadRequestException(
          'This infrastructure stack parameters are not ready.'
        );
      }

      output = await this.pulumiStackService.createResources(stack);
      // pulumiStackResult.summary.result is one of ['failed', 'in-progress', 'not-started', 'succeeded']
      if (output.summary.result === 'succeeded') {
        state = InfrastructureStackState.BUILD_SUCCEEDED;
      } else if (output.summary.result === 'in-progress') {
        state = InfrastructureStackState.BUILD_PROCESSING;
      } else if (output.summary.result === 'failed') {
        state = InfrastructureStackState.BUILD_FAILED;
      } else {
        state = InfrastructureStackState.PENDING;
      }
    } else {
      throw new BadRequestException('The infrastructure manager is invalid.');
    }

    return await this.prisma.infrastructureStack.update({
      where: {id: stack.id},
      data: {
        state: state,
        createStackOutput: output as object,
      },
    });
  }

  async destroyStack(stackId: string): Promise<InfrastructureStack> {
    // [step 1] Get the infrastructure stack.
    const stack = await this.prisma.infrastructureStack.findUniqueOrThrow({
      where: {id: stackId},
      include: {environment: {include: {project: true}}},
    });

    if (
      stack.state === InfrastructureStackState.PENDING ||
      stack.state === InfrastructureStackState.BUILD_PROCESSING ||
      stack.state === InfrastructureStackState.DESTROY_PROCESSING ||
      stack.state === InfrastructureStackState.DESTROY_SUCCEEDED
    ) {
      throw new BadRequestException(
        'The stack has not been built or is processing.'
      );
    }

    // [step 2] Delete the stack on AWS CloudFormation.
    let output: DeleteStackCommandOutput | DestroyResult;
    let state: InfrastructureStackState;
    if (stack.manager === InfrastructureStackManager.CloudFormation) {
      output = await this.cloudformationStackService.destroyResources(stack);
      state = InfrastructureStackState.DESTROY_PROCESSING;
    } else if (stack.manager === InfrastructureStackManager.Pulumi) {
      output = await this.pulumiStackService.destroyResources(stack);
      if (output.summary.result === 'succeeded') {
        state = InfrastructureStackState.DESTROY_SUCCEEDED;
      } else if (output.summary.result === 'in-progress') {
        state = InfrastructureStackState.DESTROY_PROCESSING;
      } else if (output.summary.result === 'failed') {
        state = InfrastructureStackState.DESTROY_FAILED;
      } else {
        state = InfrastructureStackState.PENDING;
      }
    } else {
      throw new BadRequestException('The infrastructure manager is invalid.');
    }

    return await this.prisma.infrastructureStack.update({
      where: {id: stack.id},
      data: {
        state: state,
        deleteStackOutput: output as object,
      },
    });
  }

  async forceDeleteOnPulumi(params: {
    pulumiOrganization: string;
    pulumiProject: string;
    pulumiStack: string;
  }) {
    return await this.pulumiStackService.forceDeleteOnPulumi(params);
  }
}
