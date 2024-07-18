import {
  CreateStackCommandOutput,
  DeleteStackCommandOutput,
} from '@aws-sdk/client-cloudformation';
import {BadRequestException, Injectable} from '@nestjs/common';
import {AwsResourceStackState} from '@prisma/client';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {
  AwsCloudFormationStackService,
  CloudFormationStackType,
} from './stack/stack.service';
import {awsResourceStackPrismaMiddleware} from './cloudformation.prisma.middleware';

@Injectable()
export class AwsCloudformationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudformationStackService: AwsCloudFormationStackService
  ) {
    this.prisma.$use(awsResourceStackPrismaMiddleware);
  }

  listStackTypes() {
    return Object.values(CloudFormationStackType);
  }

  getStackParams(params: {manager: string; type: string}) {
    return this.cloudformationStackService.getStackParams(params.type);
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
    output = await this.cloudformationStackService.destroyResources(stack);
    state = AwsResourceStackState.DESTROY_PROCESSING;

    return await this.prisma.awsResourceStack.update({
      where: {id: stack.id},
      data: {
        state: state,
        deleteStackOutput: output as object,
      },
    });
  }
}
