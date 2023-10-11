import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CfnParameter } from 'aws-cdk-lib';

import { ScopedAws } from 'aws-cdk-lib';
import { aws_config as config } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';

export interface RestrictedCommonPortsConstructProps extends cdk.StackProps {
  ssmAutomationRole: iam.Role;
}

export class RestrictedCommonPortsConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: RestrictedCommonPortsConstructProps,
  ) {
    super(scope, id);

    const { accountId } = new ScopedAws(this);

    ////////// Parameters //////////
    const isRestrictedCommonPortsConstructAutoRepaier = new CfnParameter(
      this,
      'IsRestrictedCommonPortsConstructAutoRepaier',
      {
        default: 'false',
        allowedValues: ['true', 'false'],
      },
    );

    ////////// Rules //////////

    const restrictedCommonPortsRule = new config.ManagedRule(
      this,
      'RestrictedCommonPortsRule',
      {
        configRuleName: 'RestrictedCommonPortsRule',
        identifier:
          config.ManagedRuleIdentifiers
            .EC2_SECURITY_GROUPS_RESTRICTED_INCOMING_TRAFFIC,
        inputParameters: {
          blockedPort1: 20,
          blockedPort2: 21,
          blockedPort3: 3306,
          blockedPort4: 4333,
        },
      },
    );

    // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_config.CfnRemediationConfiguration.html
    const restrictedCommonPortsRuleRemediation =
      new config.CfnRemediationConfiguration(
        this,
        'RestrictedCommonPortsRuleRemediation',
        {
          configRuleName: restrictedCommonPortsRule.configRuleName,
          targetId: 'AWS-CloseSecurityGroup',
          targetType: 'SSM_DOCUMENT',
          // targetVersion: '1',

          automatic: false,
          executionControls: {
            ssmControls: {
              concurrentExecutionRatePercentage: 2,
              errorPercentage: 5,
            },
          },
          // maximumAutomaticAttempts: 10,
          parameters: {
            AutomationAssumeRole: {
              StaticValue: {
                Values: [props.ssmAutomationRole.roleArn],
              },
            },
            SecurityGroupId: {
              ResourceValue: {
                Value: 'RESOURCE_ID',
              },
            },
          },
        },
      );
  }
}
