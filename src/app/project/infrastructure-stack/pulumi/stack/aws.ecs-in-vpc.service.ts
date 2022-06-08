import {Injectable} from '@nestjs/common';
import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';
import {PulumiUtil} from '../pulumi.util';
import {CommonUtil} from '../../../../../_util/_common.util';

@Injectable()
export class AwsEcsInVpc_StackService {
  static getStackParams() {
    return {
      vpcId: 'vpc-086e9a2695d4f7001',
      clusterName: 'development',
      repositoryName: 'nodejs',
      desiredTaskCount: 5,
    };
  }

  static checkStackParams(params: object) {
    if (params) {
      return true;
    } else {
      return false;
    }
  }

  static getStackOutputKeys() {
    return ['loadBalancerDnsName'];
  }

  static getStackProgram =
    (
      params: {
        vpcId?: string;
        clusterName?: string;
        repositoryName: string;
        desiredTaskCount?: number;
        minTaskCount?: number;
        maxTaskCount?: number;
      },
      awsRegion: string
    ) =>
    async () => {
      let vpcId = params.vpcId;
      let clusterName = params.clusterName;
      let repositoryName = params.repositoryName;
      let desiredTaskCount = params.desiredTaskCount;
      let minTaskCount = params.minTaskCount;
      let maxTaskCount = params.maxTaskCount;

      // [step 1] Guard statement.
      if (vpcId === undefined || vpcId === null || vpcId.trim() === '') {
        vpcId = (await aws.ec2.getVpc({default: true})).id;
      }
      if (
        clusterName === undefined ||
        clusterName === null ||
        clusterName.trim() === ''
      ) {
        clusterName = 'my-cluster';
      }
      if (
        repositoryName === undefined ||
        repositoryName === null ||
        repositoryName.trim() === ''
      ) {
        repositoryName = 'default';
      }
      if (desiredTaskCount === undefined || desiredTaskCount === null) {
        desiredTaskCount = 1;
      }
      if (minTaskCount === undefined || minTaskCount === null) {
        minTaskCount = 1;
      }
      if (maxTaskCount === undefined || maxTaskCount === null) {
        maxTaskCount = 100;
      }

      // [step 2] Get network resouce.
      const subnets = await aws.ec2.getSubnets({
        filters: [{name: 'vpc-id', values: [vpcId]}],
      });
      const securityGroups = await aws.ec2.getSecurityGroups({
        filters: [
          // Check out https://docs.aws.amazon.com/cli/latest/reference/ec2/describe-security-groups.html
          {
            name: 'vpc-id',
            values: [vpcId],
          },
        ],
      });

      // [step 3] Create container service.
      const repository = await aws.ecr.getRepository({
        name: repositoryName,
      });

      let uniqueResourceName = 'ecs-cluster-' + CommonUtil.randomCode(4);
      const cluster = new aws.ecs.Cluster(
        uniqueResourceName,
        {name: clusterName},
        PulumiUtil.getResourceOptions(awsRegion)
      );

      uniqueResourceName =
        'application-loadbalancer-' + CommonUtil.randomCode(4);
      const lbName = repositoryName + '-lb';
      const lb = new awsx.lb.ApplicationLoadBalancer(
        uniqueResourceName,
        {name: lbName},
        PulumiUtil.getResourceOptions(awsRegion)
      );

      uniqueResourceName = 'ecs-fargate-service-' + CommonUtil.randomCode(4);
      const containerService = new awsx.ecs.FargateService(
        uniqueResourceName,
        {
          networkConfiguration: {
            subnets: subnets.ids,
            // securityGroups: securityGroups.ids,
          },
          cluster: cluster.arn,
          desiredCount: desiredTaskCount,
          deploymentMinimumHealthyPercent: 100,
          deploymentMaximumPercent: 500,
          taskDefinitionArgs: {
            container: {
              image: repository.repositoryUrl + ':latest',
              cpu: 512,
              memory: 1024,
              essential: true,
              portMappings: [
                {
                  containerPort: 80,
                  targetGroup: lb.defaultTargetGroup,
                },
              ],
            },
          },
        },
        PulumiUtil.getResourceOptions(awsRegion)
      );

      // Config auto scaling for container cluster.
      uniqueResourceName = 'ecs-target-' + CommonUtil.randomCode(4);
      const ecsTarget = new aws.appautoscaling.Target(
        uniqueResourceName,
        {
          maxCapacity: maxTaskCount,
          minCapacity: minTaskCount,
          resourceId: pulumi.interpolate`service/${cluster.name}/${containerService.service.name}`,
          scalableDimension: 'ecs:service:DesiredCount',
          serviceNamespace: 'ecs',
        },
        PulumiUtil.getResourceOptions(awsRegion)
      );

      return {
        loadBalancerDnsName: lb.loadBalancer.dnsName,
      };
    };
}
