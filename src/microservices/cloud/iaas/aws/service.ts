import {
  CreateStackCommandOutput,
  DeleteStackCommandOutput,
} from '@aws-sdk/client-cloudformation';
import {BadRequestException, Injectable} from '@nestjs/common';
import {AwsResourceManager, AwsResourceStackState} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {
  CloudFormationStackService,
  CloudFormationStackType,
} from './cloudformation/cloudformation.service';

@Injectable()
export class AwsIaaSService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudformationStackService: CloudFormationStackService
  ) {}

  listManagers() {
    return Object.values(AwsResourceManager);
  }

  listStackTypes(manager: string) {
    if (manager === AwsResourceManager.CloudFormation) {
      return Object.values(CloudFormationStackType);
    } else if (manager === AwsResourceManager.Pulumi) {
      throw new BadRequestException(
        'Pulumi has been deprecated because it is not a formal product.'
      );
    } else {
      throw new BadRequestException('The infrastructure manager is invalid.');
    }
  }

  getStackParams(params: {manager: string; type: string}) {
    if (params.manager === AwsResourceManager.CloudFormation) {
      return this.cloudformationStackService.getStackParams(params.type);
    } else if (params.manager === AwsResourceManager.Pulumi) {
      throw new BadRequestException(
        'Pulumi has been deprecated because it is not a formal product.'
      );
    } else {
      throw new BadRequestException('The infrastructure manager is invalid.');
    }
  }

  async createStack(stackId: string) {
    // [step 1] Get the infrastructure stack.
    const stack = await this.prisma.awsResourceStack.findUniqueOrThrow({
      where: {id: stackId},
      include: {environment: true},
    });

    // if (
    //   stack.state !== AwsResourceStackState.PENDING &&
    //   stack.state !== AwsResourceStackState.DESTROY_SUCCEEDED
    // ) {
    //   throw new BadRequestException('The infrastructure has been built.');
    // }

    // [step 2] Build the infrastructure stack.
    let output: CreateStackCommandOutput;
    let state: AwsResourceStackState;
    if (stack.manager === AwsResourceManager.CloudFormation) {
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
      state = AwsResourceStackState.BUILD_PROCESSING;
    } else if (stack.manager === AwsResourceManager.Pulumi) {
      throw new BadRequestException(
        'Pulumi has been deprecated because it is not a formal product.'
      );
    } else {
      throw new BadRequestException('The infrastructure manager is invalid.');
    }

    return await this.prisma.awsResourceStack.update({
      where: {id: stack.id},
      data: {
        state: state,
        createStackOutput: output as object,
      },
    });
  }

  async destroyStack(stackId: string) {
    // [step 1] Get the infrastructure stack.
    const stack = await this.prisma.awsResourceStack.findUniqueOrThrow({
      where: {id: stackId},
      include: {environment: true},
    });

    // if (
    //   stack.state === AwsResourceStackState.PENDING ||
    //   stack.state === AwsResourceStackState.BUILD_PROCESSING ||
    //   stack.state === AwsResourceStackState.DESTROY_PROCESSING ||
    //   stack.state === AwsResourceStackState.DESTROY_SUCCEEDED
    // ) {
    //   throw new BadRequestException(
    //     'The stack has not been built or is processing.'
    //   );
    // }

    // [step 2] Delete the stack on AWS CloudFormation.
    let output: DeleteStackCommandOutput;
    let state: AwsResourceStackState;
    if (stack.manager === AwsResourceManager.CloudFormation) {
      output = await this.cloudformationStackService.destroyResources(stack);
      state = AwsResourceStackState.DESTROY_PROCESSING;
    } else if (stack.manager === AwsResourceManager.Pulumi) {
      throw new BadRequestException(
        'Pulumi has been deprecated because it is not a formal product.'
      );
    } else {
      throw new BadRequestException('The infrastructure manager is invalid.');
    }

    return await this.prisma.awsResourceStack.update({
      where: {id: stack.id},
      data: {
        state: state,
        deleteStackOutput: output as object,
      },
    });
  }
}
