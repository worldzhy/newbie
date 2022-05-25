import {Injectable} from '@nestjs/common';
import {BaseProgram} from './base.program';
import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';

@Injectable()
export class ElasticContainerCluster extends BaseProgram {
  private vpcId?: string;
  private clusterName: string = 'my-cluster';
  private repositoryName: string = 'nodejs';
  private desiredTaskCount: number = 5;

  constructor() {
    super();
    this.initPulumiProgram(this.program);
  }

  setVpcId = (id: string | null) => {
    if (id !== null && String(id).trim() !== '') {
      this.vpcId = id;
    }
    return this;
  };

  setClusterName = (name: string | null) => {
    if (name !== null && String(name).trim() !== '') {
      this.clusterName = name;
    }
    return this;
  };

  setRepositoryName = (name: string | null) => {
    if (name !== null && String(name).trim() !== '') {
      this.repositoryName = name;
    }
    return this;
  };

  setDesiredTaskCount = (num: number | null) => {
    if (num !== null) {
      this.desiredTaskCount = num;
    }
    return this;
  };

  program = async () => {
    // Get network resouce.
    if (this.vpcId === undefined) {
      this.vpcId = (await aws.ec2.getVpc({default: true})).id;
    }
    const subnetIds = await aws.ec2.getSubnetIds({
      vpcId: this.vpcId,
    });
    const securityGroups = await aws.ec2.getSecurityGroups({
      filters: [
        // Check out https://docs.aws.amazon.com/cli/latest/reference/ec2/describe-security-groups.html
        {
          name: 'vpc-id',
          values: [this.vpcId],
        },
      ],
    });

    // Get container image.
    const repository = await aws.ecr.getRepository({
      name: this.repositoryName,
    });
    const image = await aws.ecr.getImage({
      repositoryName: this.repositoryName,
      imageTag: 'latest',
    });

    // Create container service.
    const cluster = new aws.ecs.Cluster(this.clusterName);
    const lb = new awsx.lb.ApplicationLoadBalancer('nginx-lb');
    const service = new awsx.ecs.FargateService('my-service', {
      networkConfiguration: {
        subnets: subnetIds.ids,
        securityGroups: securityGroups.ids,
      },
      cluster: cluster.arn,
      desiredCount: this.desiredTaskCount.valueOf(),
      taskDefinitionArgs: {
        container: {
          image: repository.repositoryUrl + ':' + image.imageTag,
          cpu: 512,
          memory: 128,
          essential: true,
          portMappings: [
            {
              containerPort: 80,
              targetGroup: lb.defaultTargetGroup,
            },
          ],
        },
      },
    });

    return {
      url: lb.loadBalancer.dnsName,
    };
  };

  /* End */
}
