import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ScopedAws } from 'aws-cdk-lib';
import { aws_config as config } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';

export interface RestrictedSSHConstructProps extends cdk.StackProps {
  ssmAutomationRole: iam.Role;
}

export class RestrictedSSHConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: RestrictedSSHConstructProps,
  ) {
    super(scope, id);

    const { accountId } = new ScopedAws(this);

    const restrictedSSHRule = new config.ManagedRule(
      this,
      'RestrictedSSHRule',
      {
        configRuleName: 'RestrictedSSHRule',
        identifier:
          config.ManagedRuleIdentifiers
            .EC2_SECURITY_GROUPS_RESTRICTED_INCOMING_TRAFFIC,
        inputParameters: {
          blockedPort1: 22,
        },
      },
    );

    // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_config.CfnRemediationConfiguration.html
    const restrictedSSHRuleRemediation = new config.CfnRemediationConfiguration(
      this,
      'RestrictedSSHRuleRemediation',
      {
        configRuleName: restrictedSSHRule.configRuleName,
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
