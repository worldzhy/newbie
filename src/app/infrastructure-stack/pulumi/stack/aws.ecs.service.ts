import {Injectable} from '@nestjs/common';
import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';
import {PulumiUtil} from '../pulumi.util';
import {CommonUtil} from '../../../../_util/_common.util';

@Injectable()
export class AwsEcs_StackService {
  static getStackParams() {
    return {
      clusterName: 'development',
      repositoryName: 'nodejs',
      desiredTaskCount: 5,
    };
  }

  static getStackProgram =
    (
      params: {
        clusterName?: string;
        repositoryName: string;
        desiredTaskCount?: number;
        minTaskCount?: number;
        maxTaskCount?: number;
      },
      awsRegion: string
    ) =>
    async () => {
      let clusterName = params.clusterName;
      let repositoryName = params.repositoryName;
      let desiredTaskCount = params.desiredTaskCount;
      let minTaskCount = params.minTaskCount;
      let maxTaskCount = params.maxTaskCount;

      // [step 1] Guard statement.
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

      // [step 3] Create a container cluster Fargate service.
      let uniqueResourceName = 'ecs-cluster-' + CommonUtil.randomCode(4);
      const cluster = new aws.ecs.Cluster(
        uniqueResourceName,
        {name: clusterName},
        PulumiUtil.getResourceOptions(awsRegion)
      );

      const repository = await aws.ecr.getRepository({
        name: repositoryName,
      });

      uniqueResourceName =
        'application-loadbalancer-' + CommonUtil.randomCode(4);
      const lbName = repositoryName + '-lb';
      const lb = new awsx.lb.ApplicationLoadBalancer(
        uniqueResourceName,
        {name: lbName},
        PulumiUtil.getResourceOptions(awsRegion)
      );

      uniqueResourceName =
        'ecs-fargate-task-definition-' + CommonUtil.randomCode(4);
      const taskDefinition = new awsx.ecs.FargateTaskDefinition(
        uniqueResourceName,
        {
          container: {
            image: repository.repositoryUrl + ':latest',
            essential: true,
            portMappings: [
              {
                containerPort: 80,
                targetGroup: lb.defaultTargetGroup,
              },
            ],
          },
          cpu: '512',
          memory: '1024',
        },
        PulumiUtil.getResourceOptions(awsRegion)
      );

      uniqueResourceName = 'ecs-fargate-service-' + CommonUtil.randomCode(4);
      const fargateServiceName = repositoryName + '-service';
      const containerService = new awsx.ecs.FargateService(
        uniqueResourceName,
        {
          name: fargateServiceName,
          cluster: cluster.arn,
          desiredCount: desiredTaskCount,
          deploymentMinimumHealthyPercent: 100,
          deploymentMaximumPercent: 500,
          taskDefinition: taskDefinition.taskDefinition.arn,
        },
        PulumiUtil.getResourceOptions(awsRegion)
      );

      // [step 4] Create auto scaling target.
      uniqueResourceName = 'ecs-task-' + CommonUtil.randomCode(4);
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

      // [step 5] Create scaling up and scaling down policy.
      uniqueResourceName =
        'ecs-auto-scaling-up-policy-' + CommonUtil.randomCode(4);
      const scaleUpPolicy = new aws.appautoscaling.Policy(
        uniqueResourceName,
        {
          policyType: 'StepScaling',
          resourceId: ecsTarget.resourceId,
          scalableDimension: ecsTarget.scalableDimension,
          serviceNamespace: ecsTarget.serviceNamespace,
          stepScalingPolicyConfiguration: {
            adjustmentType: 'PercentChangeInCapacity',
            cooldown: 60,
            metricAggregationType: 'Maximum',
            minAdjustmentMagnitude: 1, // The least task count for increasing or decreasing.
            stepAdjustments: [
              {
                metricIntervalUpperBound: '60',
                scalingAdjustment: 100,
              },
            ],
          },
        },
        PulumiUtil.getResourceOptions(awsRegion)
      );

      uniqueResourceName =
        'ecs-auto-scaling-down-policy-' + CommonUtil.randomCode(4);
      const scaleDownPolicy = new aws.appautoscaling.Policy(
        uniqueResourceName,
        {
          policyType: 'StepScaling',
          resourceId: ecsTarget.resourceId,
          scalableDimension: ecsTarget.scalableDimension,
          serviceNamespace: ecsTarget.serviceNamespace,
          stepScalingPolicyConfiguration: {
            adjustmentType: 'PercentChangeInCapacity',
            cooldown: 60,
            metricAggregationType: 'Maximum',
            minAdjustmentMagnitude: 1, // The least task count for increasing or decreasing.
            stepAdjustments: [
              {
                metricIntervalLowerBound: '20',
                scalingAdjustment: -50,
              },
            ],
          },
        },
        PulumiUtil.getResourceOptions(awsRegion)
      );

      return {
        url: lb.loadBalancer.dnsName,
      };
    };
}
