import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CfnParameter } from 'aws-cdk-lib';

import { ConfigAutomationIamConstruct } from '../construct/iam-role';
import { CloseSecurityGroup } from '../construct/rules/close-security-group';
import { RdsSnapshotsPublicProhibitedConstruct } from '../construct/rules/rds-snapshots-public-prohibited';
import { DisablePublicAccessToRDSInstanceConstruct } from '../construct/rules/disable-public-access-to-rds-instance';
import { EnableEbsEncryptionByDefaultConstruct } from '../construct/rules/enable-ebs-encryption-by-default';
import { CreateEncryptedRdsSnapshotConstruct } from '../construct/rules/create-encrypted-rds-snapshot';

export class ConfigAutomationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    ////////// IAM Role //////////
    const configAutomationIamConstruct = new ConfigAutomationIamConstruct(
      this,
      'ConfigAutomationIamConstruct',
    );

    // const enableAutomaticRepaier = new CfnParameter(
    //   this,
    //   'EnableAutomaticRepaier',
    //   {
    //     default: 'false',
    //     allowedValues: ['true', 'false'],
    //   },
    // );

    ////////// Rules //////////

    const restrictedCommonPortsConstruct = new CloseSecurityGroup(
      this,
      'RestrictedCommonPortsConstruct',
      {
        ssmAutomationRole: configAutomationIamConstruct.ssmAutomationRole,
      },
    );

    const enableEbsEncryptionByDefaultConstruct =
      new EnableEbsEncryptionByDefaultConstruct(
        this,
        'EnableEbsEncryptionByDefaultConstruct',
        {
          ssmAutomationRole: configAutomationIamConstruct.ssmAutomationRole,
        },
      );

    // }

    const rdsSnapshotsPublicProhibitedConstruct =
      new RdsSnapshotsPublicProhibitedConstruct(
        this,
        'RdsSnapshotsPublicProhibitedConstruct',
        {
          ssmAutomationRole: configAutomationIamConstruct.ssmAutomationRole,
        },
      );

    const disablePublicAccessToRDSInstanceConstruct =
      new DisablePublicAccessToRDSInstanceConstruct(
        this,
        'DisablePublicAccessToRDSInstanceConstruct',
        {
          ssmAutomationRole: configAutomationIamConstruct.ssmAutomationRole,
        },
      );

    const createEncryptedRdsSnapshotConstruct =
      new CreateEncryptedRdsSnapshotConstruct(
        this,
        'CreateEncryptedRdsSnapshotConstruct',
        {
          ssmAutomationRole: configAutomationIamConstruct.ssmAutomationRole,
        },
      );

    // }
  }
}
