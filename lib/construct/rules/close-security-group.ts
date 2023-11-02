import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CfnParameter } from 'aws-cdk-lib';

import { ScopedAws } from 'aws-cdk-lib';
import { aws_config as config } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';

export interface CloseSecurityGroupProps extends cdk.StackProps {
  ssmAutomationRole: iam.Role;
}

export class CloseSecurityGroup extends Construct {
  constructor(scope: Construct, id: string, props: CloseSecurityGroupProps) {
    super(scope, id);

    const { accountId } = new ScopedAws(this);

    ////////// Parameters //////////
    const isCloseSecurityGroupAutoRepaier = new CfnParameter(
      this,
      'IsCloseSecurityGroupAutoRepaier',
      {
        default: 'false',
        allowedValues: ['true', 'false'],
      },
    );

    ////////// Rules //////////

    const closeSecurityGroupRule = new config.ManagedRule(
      this,
      'CloseSecurityGroupRule',
      {
        configRuleName: 'CloseSecurityGroupRule',
        identifier:
          config.ManagedRuleIdentifiers
            .EC2_SECURITY_GROUPS_RESTRICTED_INCOMING_TRAFFIC,
        inputParameters: {
          blockedPort1: 22,
          blockedPort2: 3389,
        },
      },
    );

    // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_config.CfnRemediationConfiguration.html
    const closeSecurityGroupRuleRemediation =
      new config.CfnRemediationConfiguration(
        this,
        'CloseSecurityGroupRuleRemediation',
        {
          configRuleName: closeSecurityGroupRule.configRuleName,
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
