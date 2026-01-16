import { ApiAccountEntity } from '@servicelabsco/slabs-access-manager';
import { Column, Entity } from 'typeorm';

/**
 * entity definition against the bz_api_accounts table
 * @export
 * @class ApiAccountEntity
 * @extends {CommonEntity}
 */
@Entity('bz_api_accounts')
export class CommunicationApiAccountEntity extends ApiAccountEntity {
  @Column()
  name: string;
}
