import {Injectable} from '@nestjs/common';
import {BaseProgram} from './base.program';
import * as awsx from '@pulumi/awsx';
import * as eks from '@pulumi/eks';
import * as k8s from '@pulumi/kubernetes';
import {Config} from '../../../_common/_common.config';

@Injectable()
export class ElasticCompute extends BaseProgram {
  private clusterName: string = 'my-cluster';
  private instanceType: string = 't3.medium';
  private desiredNodeNumber: number = 5;
  private minNodeNumber: number = 1;
  private maxNodeNumber: number = 100;

  constructor() {
    super();
    this.initPulumiProgram(this.program);
  }

  setClusterName = (name: string) => {
    this.clusterName = name;
    return this;
  };

  setInstanceType = (instanceType: string) => {
    this.instanceType = instanceType;
    return this;
  };

  setDesiredNodeNumber = (num: number) => {
    this.desiredNodeNumber = num;
    return this;
  };

  setMinNodeNumber = (num: number) => {
    this.minNodeNumber = num;
    return this;
  };

  setMaxNodeNumber = (num: number) => {
    this.maxNodeNumber = num;
    return this;
  };

  program = async () => {
    // Create an EKS cluster with the default configuration.
    const cluster = new eks.Cluster(
      this.clusterName,
      {
        // vpcId: vpc.id,
        // publicSubnetIds: vpc.publicSubnetIds,
        // privateSubnetIds: vpc.privateSubnetIds,
        // nodeAssociatePublicIpAddress: false,
        instanceType: this.instanceType,
        desiredCapacity: this.desiredNodeNumber,
        minSize: this.minNodeNumber,
        maxSize: this.maxNodeNumber,
        enabledClusterLogTypes: [
          'api',
          'audit',
          'authenticator',
          'controllerManager',
          'scheduler',
        ],
      },
      {
        transformations: [
          // Update all RolePolicyAttachment resources to use aws-cn ARNs.
          args => {
            if (
              args.type ===
                'aws:iam/rolePolicyAttachment:RolePolicyAttachment' &&
              this.awsRegion.startsWith('cn')
            ) {
              const arn: string | undefined = args.props['policyArn'];
              if (arn && arn.startsWith('arn:aws:iam')) {
                args.props['policyArn'] = arn.replace(
                  'arn:aws:iam',
                  'arn:aws-cn:iam'
                );
              }
              return {
                props: args.props,
                opts: args.opts,
              };
            }
            return undefined;
          },
        ],
      }
    );

    // Build and publish our app's container image.
    const image = new awsx.ecr.Image('image', {
      repositoryUrl:
        '077767357755.dkr.ecr.cn-northwest-1.amazonaws.com.cn/nodejs',
    });

    // Create a NGINX Deployment and load balanced Service, running our app.
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
                  image: image.imageUri,
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

  /* End */
}
