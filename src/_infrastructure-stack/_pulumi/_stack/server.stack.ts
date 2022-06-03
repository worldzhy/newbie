import * as aws from '@pulumi/aws';
import * as eks from '@pulumi/eks';
import * as k8s from '@pulumi/kubernetes';
import {Config} from 'src/_config/_common.config';
import {PulumiUtil} from '../_util';

export const createServerComputingStack =
  (params: {
    vpcId?: string;
    clusterName?: string;
    repositoryName: string;
    instanceType: string;
    desiredInstanceCount?: number;
    minInstanceCount?: number;
    maxInstanceCount?: number;
  }) =>
  async () => {
    let vpcId = params.vpcId;
    let clusterName = params.clusterName;
    let repositoryName = params.repositoryName;
    let instanceType = params.instanceType;
    let desiredInstanceCount = params.desiredInstanceCount;
    let minInstanceCount = params.minInstanceCount;
    let maxInstanceCount = params.maxInstanceCount;

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

    if (
      instanceType === undefined ||
      instanceType === null ||
      instanceType.trim() === ''
    ) {
      instanceType = 't3.medium';
    }

    if (desiredInstanceCount === undefined || desiredInstanceCount === null) {
      desiredInstanceCount = 1;
    }
    if (minInstanceCount === undefined || minInstanceCount === null) {
      minInstanceCount = 1;
    }
    if (maxInstanceCount === undefined || maxInstanceCount === null) {
      maxInstanceCount = 1;
    }

    // [step 2] Create an EKS cluster with the default configuration.
    const cluster = new eks.Cluster(
      clusterName,
      {
        // vpcId: vpc.id,
        // publicSubnetIds: vpc.publicSubnetIds,
        // privateSubnetIds: vpc.privateSubnetIds,
        // nodeAssociatePublicIpAddress: false,
        instanceType: instanceType,
        desiredCapacity: desiredInstanceCount,
        minSize: minInstanceCount,
        maxSize: maxInstanceCount,
        enabledClusterLogTypes: [
          'api',
          'audit',
          'authenticator',
          'controllerManager',
          'scheduler',
        ],
      },
      PulumiUtil.resourceOptions
    );

    // [step 3] Deployment and running application.
    const repository = await aws.ecr.getRepository({name: repositoryName});

    const appName = 'my-app';
    const appLabels = {appClass: appName};
    const deployment = new k8s.apps.v1.Deployment(
      `${appName}-dep`,
      {
        metadata: {labels: appLabels},
        spec: {
          replicas: 2,
          selector: {matchLabels: appLabels},
          template: {
            metadata: {labels: appLabels},
            spec: {
              containers: [
                {
                  name: appName,
                  image: repository.repositoryUrl + ':latest',
                  ports: [{name: 'http', containerPort: 3000}],
                },
              ],
            },
          },
        },
      },
      {provider: cluster.provider}
    );
    const service = new k8s.core.v1.Service(
      `${appName}-svc`,
      {
        metadata: {labels: appLabels},
        spec: {
          type: 'LoadBalancer',
          ports: [{port: 3000, targetPort: 'http'}],
          selector: appLabels,
        },
      },
      {provider: cluster.provider}
    );

    return {
      kubeconfig: cluster.kubeconfig,
      url: service.status.loadBalancer.ingress[0].hostname,
    };
  };
