import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ScopedAws } from 'aws-cdk-lib';
import { aws_config as config } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';

export interface RestrictedRDPConstructProps extends cdk.StackProps {
  ssmAutomationRole: iam.Role;
}

export class RestrictedRDPConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: RestrictedRDPConstructProps,
  ) {
    super(scope, id);

    const { accountId } = new ScopedAws(this);

    const restrictedRDPRule = new config.ManagedRule(
      this,
      'RestrictedRDPRule',
      {
        configRuleName: 'RestrictedRDPRule',
        identifier:
          config.ManagedRuleIdentifiers
            .EC2_SECURITY_GROUPS_RESTRICTED_INCOMING_TRAFFIC,
        inputParameters: {
          blockedPort1: 3389,
        },
      },
    );

    // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_config.CfnRemediationConfiguration.html
    const restrictedRDPRuleRemediation = new config.CfnRemediationConfiguration(
      this,
      'RestrictedRDPRuleRemediation',
      {
        configRuleName: restrictedRDPRule.configRuleName,
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
