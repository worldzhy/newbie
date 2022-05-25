import {Injectable} from '@nestjs/common';
import {BaseProgram} from './base.stack';
import * as aws from '@pulumi/aws';
import * as eks from '@pulumi/eks';
import * as k8s from '@pulumi/kubernetes';

@Injectable()
export class ElasticServerCluster extends BaseProgram {
  private clusterName: string = 'my-cluster';
  private instanceType: string = 't3.medium';
  private repositoryName: string = 'nodejs';
  private desiredNodeCount: number = 5;
  private minNodeCount: number = 1;
  private maxNodeCount: number = 100;

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

  setDesiredNodeCount = (num: number) => {
    this.desiredNodeCount = num;
    return this;
  };

  setMinNodeCount = (num: number) => {
    this.minNodeCount = num;
    return this;
  };

  setMaxNodeCount = (num: number) => {
    this.maxNodeCount = num;
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
        desiredCapacity: this.desiredNodeCount,
        minSize: this.minNodeCount,
        maxSize: this.maxNodeCount,
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

    // Get app's container image.
    const repository = await aws.ecr.getRepository({name: this.repositoryName});
    const image = await aws.ecr.getImage({
      repositoryName: this.repositoryName,
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
                  image: repository.repositoryUrl + ':' + image.imageTag,
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
