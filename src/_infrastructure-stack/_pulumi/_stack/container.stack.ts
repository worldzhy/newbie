import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';
import {PulumiUtil} from '../_util';

export const createContainerClusterStack =
  (params: {
    clusterName?: string;
    repositoryName: string;
    desiredTaskCount?: number;
    minTaskCount?: number;
    maxTaskCount?: number;
  }) =>
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
    const cluster = new aws.ecs.Cluster(
      clusterName,
      undefined,
      PulumiUtil.resourceOptions
    );

    const repository = await aws.ecr.getRepository({
      name: repositoryName,
    });

    const lbName = repositoryName + '-lb';
    const lb = new awsx.lb.ApplicationLoadBalancer(
      lbName,
      undefined,
      PulumiUtil.resourceOptions
    );

    const taskDefinitionName = repositoryName + '-task-definition';
    const taskDefinition = new awsx.ecs.FargateTaskDefinition(
      taskDefinitionName,
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
      PulumiUtil.resourceOptions
    );

    const containerServiceName = repositoryName + '-service';
    const containerService = new awsx.ecs.FargateService(
      containerServiceName,
      {
        cluster: cluster.arn,
        desiredCount: desiredTaskCount,
        deploymentMinimumHealthyPercent: 100,
        deploymentMaximumPercent: 500,
        taskDefinition: taskDefinition.taskDefinition.arn,
      },
      PulumiUtil.resourceOptions
    );

    // [step 4] Create auto scaling target.
    const scalableTargetName = 'ecs_target';
    const ecsTarget = new aws.appautoscaling.Target(
      scalableTargetName,
      {
        maxCapacity: maxTaskCount,
        minCapacity: minTaskCount,
        resourceId: pulumi.interpolate`service/${cluster.name}/${containerService.service.name}`,
        scalableDimension: 'ecs:service:DesiredCount',
        serviceNamespace: 'ecs',
      },
      PulumiUtil.resourceOptions
    );

    // [step 5] Create scaling up and scaling down policy.
    const scaleUpPolicyName = 'ecs-scale-up-policy';
    const scaleUpPolicy = new aws.appautoscaling.Policy(
      scaleUpPolicyName,
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
      PulumiUtil.resourceOptions
    );

    const scaleDownPolicyName = 'ecs-scale-down-policy';
    const scaleDownPolicy = new aws.appautoscaling.Policy(
      scaleDownPolicyName,
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
      PulumiUtil.resourceOptions
    );

    return {
      url: lb.loadBalancer.dnsName,
    };
  };
