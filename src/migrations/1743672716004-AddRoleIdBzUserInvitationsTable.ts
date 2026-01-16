import { MigrationUtility } from '@servicelabsco/nestjs-utility-services';

export class AddRoleIdBzUserInvitationsTable1743672716004 extends MigrationUtility {
  constructor() {
    super('bz_user_invitations');
    this.process();
  }

  process() {
    this.foreign({ name: 'role_id', foreignTable: 'utl_role_groups' });
  }
}
