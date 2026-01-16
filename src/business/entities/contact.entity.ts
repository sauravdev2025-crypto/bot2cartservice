import { CommonEntity } from '@servicelabsco/nestjs-utility-services';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ContactAttributesDto } from '../dtos/contact.attributes.dto';
import { BusinessEntity } from './business.entity';
import { CommunicationBusinessUserEntity } from './communication.business.user.entity';

/**
 * entity definition against the bz_contact_details table
 * @export
 * @class ContactEntity
 * @extends {CommonEntity}
 */
@Entity('bz_contact_details')
export class ContactEntity extends CommonEntity {
  @Column()
  name: string;

  @Column()
  display_name: string;

  @Column()
  business_id: number;

  @Column()
  dialing_code: number;

  @Column()
  mobile: string;

  @Column()
  identifier: string;

  @Column()
  masked_phone: string;

  @Column()
  active: boolean;

  @Column()
  allow_broadcast: boolean;

  @Column()
  is_assigned_to_bot: boolean;

  @Column('json')
  custom_attributes: any;

  @Column()
  is_system_generated: boolean;

  @Column()
  wa_id: string;

  @Column()
  validated_at: Date;

  @Column()
  managed_by: number;

  @Column('json')
  attributes: ContactAttributesDto;

  /** all related methods to go below this */
  @ManyToOne(() => BusinessEntity) @JoinColumn({ name: 'business_id' }) business: BusinessEntity;
  @ManyToOne(() => CommunicationBusinessUserEntity) @JoinColumn({ name: 'managed_by' }) manager: CommunicationBusinessUserEntity;
}
