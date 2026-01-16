import { UserEntity } from '@servicelabsco/nestjs-utility-services';
import { AccessBusinessEntity } from '@servicelabsco/slabs-access-manager';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

/**
 * entity definition against the bz_business_details table
 * @export
 * @class BusinessEntity
 * @extends {CommonEntity}
 */

@Entity('bz_business_details')
export class BusinessEntity extends AccessBusinessEntity {
  @Column()
  internal_id: string;

  @Column()
  internal_access_token: string;

  @Column()
  internal_number: string;

  @Column()
  verified_at: Date;

  @Column()
  expired_at: Date;

  @Column()
  default_mobile: string;

  @Column()
  phone_registered_at: Date;

  @Column('json')
  last_health_status: any;

  @Column('json')
  quality_response: any;

  @Column()
  wa_display_name: string;

  @Column()
  total_message_limit: number;

  @Column()
  total_sent: number;

  @Column()
  is_partner_account: boolean;

  @Column()
  parent_id: number;

  @Column('json')
  attributes: any;

  @ManyToOne(() => UserEntity) @JoinColumn({ name: 'owner_id' }) owner: UserEntity;
  @ManyToOne(() => BusinessEntity) @JoinColumn({ name: 'parent_id' }) parent: BusinessEntity;
}
