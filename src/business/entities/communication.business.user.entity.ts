import { BusinessUserEntity } from '@servicelabsco/slabs-access-manager';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BusinessEntity } from './business.entity';

/**
 * entity definition against the bz_business_users table
 * @export
 * @class BusinessUserEntity
 * @extends {CommonEntity}
 */
@Entity('bz_business_users')
export class CommunicationBusinessUserEntity extends BusinessUserEntity {
  @Column()
  accepted_at: Date;

  @Column()
  mfa_required: boolean;

  @Column()
  manager_id: number;

  @ManyToOne(() => CommunicationBusinessUserEntity) @JoinColumn({ name: 'manager_id' }) manager: CommunicationBusinessUserEntity;
  @ManyToOne(() => BusinessEntity) @JoinColumn({ name: 'business_id' }) business: BusinessEntity;
}
