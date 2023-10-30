import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ScopedAws } from 'aws-cdk-lib';
import { aws_config as config } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { CfnParameter } from 'aws-cdk-lib';

export interface DisablePublicAccessToRDSInstanceProps extends cdk.StackProps {
  ssmAutomationRole: iam.Role;
}

export class DisablePublicAccessToRDSInstanceConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: DisablePublicAccessToRDSInstanceProps,
  ) {
    super(scope, id);

    const { accountId } = new ScopedAws(this);
    ////////// Parameters //////////

    const isDisablePublicAccessToRDSInstanceConstructAutoRepaier =
      new CfnParameter(
        this,
        'IsDisablePublicAccessToRDSInstanceConstructAutoRepaier',
        {
          default: 'false',
          allowedValues: ['True', 'false'],
        },
      );

    ////////// Rules //////////
    const disablePublicAccessToRDSInstanceRule = new config.ManagedRule(
      this,
      'DisablePublicAccessToRDSInstanceRule',
      {
        configRuleName: 'DisablePublicAccessToRDSInstanceRule',
        identifier:
          config.ManagedRuleIdentifiers.RDS_INSTANCE_PUBLIC_ACCESS_CHECK,
      },
    );

    // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_config.CfnRemediationConfiguration.html
    const rdsSnapshotsPublicProhibitedRuleRemediation =
      new config.CfnRemediationConfiguration(
        this,
        'RdsSnapshotsPublicProhibitedRuleRemediation',
        {
          configRuleName: disablePublicAccessToRDSInstanceRule.configRuleName,
          targetId: 'AWSConfigRemediation-DisablePublicAccessToRDSInstance',
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
            DbiResourceId: {
              ResourceValue: {
                Value: 'RESOURCE_ID',
              },
            },
            AutomationAssumeRole: {
              StaticValue: {
                Values: [props.ssmAutomationRole.roleArn],
              },
            },
          },
        },
      );
  }
}
