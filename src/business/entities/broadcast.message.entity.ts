import { CommonEntity } from '@servicelabsco/nestjs-utility-services';
import { Column, Entity, JoinColumn, ManyToMany } from 'typeorm';
import { BroadcastMessageAttributesDto } from '../dtos/broadcast.message.attributes.dto';
import { MessageStatusEnum } from '../enums/message.status.enum';
import { BusinessEntity } from './business.entity';
import { CommunicationWhatsappTemplateEntity } from './communication.whatsapp.template.entity';

/**
 * entity definition against the bz_broadcast_messages table
 * @export
 * @class BroadcastMessageEntity
 * @extends {CommonEntity}
 */
@Entity('bz_broadcast_messages')
export class BroadcastMessageEntity extends CommonEntity {
  @Column()
  source_type: string;

  @Column()
  source_id: number;

  @Column()
  status_id: MessageStatusEnum;

  @Column()
  business_id: number;

  @Column()
  template_id: number;

  @Column()
  initiated_at: Date;

  @Column()
  scheduled_at: Date;

  @Column()
  sent_at: Date;

  @Column()
  delivered_at: Date;

  @Column()
  read_at: Date;

  @Column()
  is_error: boolean;

  @Column()
  is_log: boolean;

  @Column()
  is_replied: boolean;

  @Column()
  from_external_source: boolean;

  @Column()
  active: boolean;

  @Column()
  dialing_code: number;

  @Column()
  mobile: string;

  @Column()
  message_id: string;

  @Column()
  parent_id: number;

  @Column('json')
  response: any;

  @Column('json')
  webhook_response: any;

  @Column('json')
  payload: any;

  @Column('json')
  attributes: BroadcastMessageAttributesDto;

  /** all related methods to go below this */

  @ManyToMany(() => BusinessEntity) @JoinColumn({ name: 'business_id' }) business: BusinessEntity;
  @ManyToMany(() => CommunicationWhatsappTemplateEntity) @JoinColumn({ name: 'template_id' }) template: CommunicationWhatsappTemplateEntity;
  @ManyToMany(() => CommunicationWhatsappTemplateEntity) @JoinColumn({ name: 'parent_id' }) parent: BroadcastMessageEntity;
}
