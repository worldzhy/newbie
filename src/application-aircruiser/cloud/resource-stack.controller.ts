import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Body,
  Param,
  BadRequestException,
  Query,
} from '@nestjs/common';
import {ApiTags, ApiBearerAuth, ApiBody} from '@nestjs/swagger';
import {AwsResourceStack, AwsResourceStackState, Prisma} from '@prisma/client';
import {CloudFormationStackType} from '@microservices/cloud/iaas/aws/cloudformation/cloudformation.service';
import {PrismaService} from '@toolkit/prisma/prisma.service';
import {AwsIaaSService} from '@microservices/cloud/iaas/aws/service';

@ApiTags('Cloud Resource Stack')
@ApiBearerAuth()
@Controller('aws-resource-stacks')
export class AwsResourceStackController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly awsIaaSService: AwsIaaSService
  ) {}

  @Get('types')
  listStackTypes() {
    return this.awsIaaSService.listStackTypes();
  }

  @Get('params')
  async getStackParams(
    @Query('type') type: string,
    @Query('manager') manager: string
  ) {
    return this.awsIaaSService.getStackParams({manager, type});
  }

  @Post('')
  @ApiBody({
    description: 'Create infrastructure stack.',
    examples: {
      a: {
        summary: '1. CloudFormation stack',
        value: {
          type: CloudFormationStackType.MESSAGE_TRACKER,
          params: {
            DatabaseHost:
              'solidcore-dev.ccjlptnm8vot.us-east-1.rds.amazonaws.com',
            DatabasePort: '5432',
            DatabaseMasterUsername: 'postgres',
            DatabaseMasterUserPassword: 'postgres',
            DatabaseName: 'postgres',
            SESIdentityARN:
              'arn:aws:ses:us-east-1:196438055748:identity/info@solidcore.co',
            FromAddress: 'info@solidcore.co',
          },
          environmentId: '013f92b0-4a53-45cb-8eca-e66089a3919f',
        },
      },
    },
  })
  async createStack(
    @Body()
    body: Prisma.AwsResourceStackUncheckedCreateInput
  ): Promise<AwsResourceStack> {
    return await this.prisma.awsResourceStack.create({data: body});
  }

  @Get('')
  async getStacks(@Query('environmentId') environmentId: number) {
    return await this.prisma.findManyInOnePage({
      model: Prisma.ModelName.AwsResourceStack,
      findManyArgs: {where: {environmentId}},
    });
  }

  @Get(':stackId')
  async getStack(@Param('stackId') stackId: string): Promise<AwsResourceStack> {
    return await this.prisma.awsResourceStack.findUniqueOrThrow({
      where: {id: stackId},
    });
  }

  @Patch(':stackId')
  @ApiBody({
    description: 'Update infrastructure stack.',
    examples: {
      a: {
        summary: '1. AWS VPC stack',
        value: {
          params: {
            vpcName: 'pulumi-test-vpc-modified',
            vpcCidrBlock: '10.21.0.0/16',
          },
        },
      },
      b: {
        summary: '2. Database stack',
        value: {
          params: {
            instanceName: 'postgres-default-modified',
            instanceClass: 'db.t3.small',
          },
        },
      },
    },
  })
  async updateStack(
    @Param('stackId') stackId: string,
    @Body()
    body: Prisma.AwsResourceStackUpdateInput
  ): Promise<AwsResourceStack> {
    return await this.prisma.awsResourceStack.update({
      where: {id: stackId},
      data: body,
    });
  }

  @Delete(':stackId')
  async deleteStack(
    @Param('stackId')
    stackId: string
  ): Promise<AwsResourceStack> {
    // [step 1] Get the infrastructure stack.
    const stack = await this.prisma.awsResourceStack.findUniqueOrThrow({
      where: {id: stackId},
    });

    if (
      stack.state !== AwsResourceStackState.PENDING &&
      stack.state !== AwsResourceStackState.DESTROY_SUCCEEDED
    ) {
      throw new BadRequestException(
        'The stack record can not be deleted because the infrastructure resource is still there.'
      );
    }

    // [step 2] Delete the stack record on database.
    return await this.prisma.awsResourceStack.delete({where: {id: stackId}});
  }

  //* Create resources
  @Post(':stackId/create-resources')
  async createResources(
    @Param('stackId')
    stackId: string
  ): Promise<AwsResourceStack> {
    return await this.awsIaaSService.createStack(stackId);
  }

  //* Destroy resources
  @Post(':stackId/destroy-resources')
  async destroyResources(
    @Param('stackId')
    stackId: string
  ): Promise<AwsResourceStack> {
    return await this.awsIaaSService.destroyStack(stackId);
  }

  /* End */
}
