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
  is_partner_account: boolean;

  @Column()
  parent_id: number;

  @Column('json')
  attributes: any;

  @ManyToOne(() => UserEntity) @JoinColumn({ name: 'owner_id' }) owner: UserEntity;
  @ManyToOne(() => BusinessEntity) @JoinColumn({ name: 'parent_id' }) parent: BusinessEntity;
}
