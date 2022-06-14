import {Injectable} from '@nestjs/common';
import * as aws from '@pulumi/aws';
import {PulumiUtil} from '../pulumi.util';

@Injectable()
export class AwsWaf_StackService {
  static getStackParams() {
    return {
      applicationLoadBalancerArn:
        'arn:aws-cn:elasticloadbalancing:cn-northwest-1:077767357755:loadbalancer/app/EC2Co-EcsEl-MGLLJA763BKU/72d6e710220b1e44',
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
    return [];
  }

  static getStackProgram =
    (params: {applicationLoadBalancerArn: string}, awsRegion: string) =>
    async () => {
      // [step 1] Create rule group.
      let uniqueResourceName = 'waf-rule-group';
      const ruleGroup = new aws.wafv2.RuleGroup(
        uniqueResourceName,
        {
          capacity: 10,
          scope: 'REGIONAL',
          rules: [
            {
              name: 'rule-1',
              priority: 1,
              action: {
                count: {},
              },
              statement: {
                geoMatchStatement: {
                  countryCodes: ['NL'],
                },
              },
              visibilityConfig: {
                cloudwatchMetricsEnabled: false,
                metricName: 'friendly-rule-metric-name',
                sampledRequestsEnabled: false,
              },
            },
            {
              name: 'rule-to-exclude-a',
              priority: 10,
              action: {
                allow: {},
              },
              statement: {
                geoMatchStatement: {
                  countryCodes: ['US'],
                },
              },
              visibilityConfig: {
                cloudwatchMetricsEnabled: false,
                metricName: 'friendly-rule-metric-name',
                sampledRequestsEnabled: false,
              },
            },
            {
              name: 'rule-to-exclude-b',
              priority: 15,
              action: {
                allow: {},
              },
              statement: {
                geoMatchStatement: {
                  countryCodes: ['GB'],
                },
              },
              visibilityConfig: {
                cloudwatchMetricsEnabled: false,
                metricName: 'friendly-rule-metric-name',
                sampledRequestsEnabled: false,
              },
            },
          ],
          visibilityConfig: {
            cloudwatchMetricsEnabled: false,
            metricName: 'friendly-metric-name',
            sampledRequestsEnabled: false,
          },
        },
        PulumiUtil.getResourceOptions(awsRegion)
      );

      // [step 2] Create web ACL.
      uniqueResourceName = 'waf-acl';
      const webAcl = new aws.wafv2.WebAcl(
        uniqueResourceName,
        {
          defaultAction: {
            allow: {},
          },
          description: 'Example of a managed rule.',
          rules: [
            // AWS managed rule
            {
              name: 'rule-1',
              overrideAction: {
                count: {},
              },
              priority: 1,
              statement: {
                managedRuleGroupStatement: {
                  excludedRules: [
                    {
                      name: 'SizeRestrictions_QUERYSTRING',
                    },
                    {
                      name: 'NoUserAgent_HEADER',
                    },
                  ],
                  name: 'AWSManagedRulesCommonRuleSet',
                  scopeDownStatement: {
                    geoMatchStatement: {
                      countryCodes: ['US', 'NL'],
                    },
                  },
                  vendorName: 'AWS',
                },
              },
              visibilityConfig: {
                cloudwatchMetricsEnabled: false,
                metricName: 'friendly-rule-metric-name',
                sampledRequestsEnabled: false,
              },
            },
            // Rate based rule
            {
              action: {
                block: {},
              },
              name: 'rule-1',
              priority: 1,
              statement: {
                rateBasedStatement: {
                  aggregateKeyType: 'IP',
                  limit: 10000,
                  scopeDownStatement: {
                    geoMatchStatement: {
                      countryCodes: ['US', 'NL'],
                    },
                  },
                },
              },
              visibilityConfig: {
                cloudwatchMetricsEnabled: false,
                metricName: 'friendly-rule-metric-name',
                sampledRequestsEnabled: false,
              },
            },
            // rule group
            {
              name: 'rule-1',
              priority: 1,
              overrideAction: {
                count: {},
              },
              statement: {
                ruleGroupReferenceStatement: {
                  arn: ruleGroup.arn,
                  excludedRules: [
                    {
                      name: 'rule-to-exclude-b',
                    },
                    {
                      name: 'rule-to-exclude-a',
                    },
                  ],
                },
              },
              visibilityConfig: {
                cloudwatchMetricsEnabled: false,
                metricName: 'friendly-rule-metric-name',
                sampledRequestsEnabled: false,
              },
            },
          ],
          scope: 'REGIONAL',
          tags: {
            Tag1: 'Value1',
            Tag2: 'Value2',
          },
          visibilityConfig: {
            cloudwatchMetricsEnabled: false,
            metricName: 'friendly-metric-name',
            sampledRequestsEnabled: false,
          },
        },
        PulumiUtil.getResourceOptions(awsRegion)
      );

      // [step 3] Associate web ACL with application loadbalancer.
      uniqueResourceName = 'waf-acl-association';
      new aws.wafv2.WebAclAssociation(
        uniqueResourceName,
        {
          resourceArn: params.applicationLoadBalancerArn,
          webAclArn: webAcl.arn,
        },
        PulumiUtil.getResourceOptions(awsRegion)
      );
    };
}
