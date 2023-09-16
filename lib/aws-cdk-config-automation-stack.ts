import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ScopedAws } from 'aws-cdk-lib';
import { aws_config as config } from 'aws-cdk-lib';
import { aws_ssm as ssm } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { aws_ssmincidents as ssmincidents } from 'aws-cdk-lib';

export class AwsCdkConfigAutomationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // const { accountId } = new ScopedAws(this);

    const s3AccessPolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          actions: ['s3:*'],
          resources: ['*'],
        }),
      ],
    });

    const ssmAutomationRole = new iam.Role(this, 'testSsmAutomationRole', {
      roleName: 'TestSsmAutomationRole',
      assumedBy: new iam.ServicePrincipal('ssm.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AmazonSSMAutomationRole',
        ),
        // iam.ManagedPolicy.fromAwsManagedPolicyName("AWSXrayWriteOnlyAccess"),
      ],
      inlinePolicies: {
        s3AccessPolicy,
      },
    });

    const sgRestrictedIncomingConfigRule = new config.ManagedRule(
      this,
      'SgRestrictedIncomingConfigRule',
      {
        identifier:
          config.ManagedRuleIdentifiers
            .EC2_SECURITY_GROUPS_RESTRICTED_INCOMING_TRAFFIC,
        inputParameters: {
          blockedPort1: 20,
          blockedPort2: 21,
          blockedPort3: 3389,
          blockedPort4: 3306,
          blockedPort5: 4333,
        },

        // default is 24 hours
        // maximumExecutionFrequency:
        // config.MaximumExecutionFrequency.TWELVE_HOURS,
      },
    );

    // const parameters: any = {
    //   AutomationAssumeRole: {
    //     staticValue: {
    //       values: [ssmAutomationRole.roleArn],
    //     },
    //   },
    //   SecurityGroupId: {
    //     resourceValue: {
    //       value: 'RESOURCE_ID',
    //     },
    //   },
    // };

    // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_config.CfnRemediationConfiguration.html
    const sgRestrictedIncomingConfigRuleRemediation =
      new config.CfnRemediationConfiguration(
        this,
        'SgRestrictedIncomingConfigRuleRemediation',
        {
          configRuleName: sgRestrictedIncomingConfigRule.configRuleName,
          targetId: 'AWS-CloseSecurityGroup',
          targetType: 'SSM_DOCUMENT',
          // targetVersion: '1',

          // the properties below are optional
          automatic: false,
          executionControls: {
            ssmControls: {
              concurrentExecutionRatePercentage: 2,
              errorPercentage: 5,
            },
          },
          // maximumAutomaticAttempts: 10,
          parameters: {
            automationAssumeRole: {
              staticValue: {
                values: [ssmAutomationRole.roleArn],
              },
            },
            securityGroupId: {
              resourceValue: {
                value: 'RESOURCE_ID',
              },
            },
          },
          // resourceType: 'resourceType',
          // retryAttemptSeconds: 123,
        },
      );
  }
  // const securityGroupConfigRuleAutomation = new ssm.
}
