import { CommonEntity, LookupValueEntity } from '@servicelabsco/nestjs-utility-services';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { SystemLanguageEntity } from '../../utility/entities/system.language.entity';
import { CommunicationWhatsappTemplateAttributesDto } from '../dtos/communication.whatsapp.template.attributes.dto';
import { BusinessEntity } from './business.entity';
import { TemplateState } from '../dtos/whatsapp.template.dto';

/**
 * entity definition against the bz_whatsapp_templates table
 * @export
 * @class WhatsappTemplateEntity
 * @extends {CommonEntity}
 */
@Entity('bz_communication_whatsapp_templates')
export class CommunicationWhatsappTemplateEntity extends CommonEntity {
  @Column({ length: 250 })
  identifier: string;

  @Column()
  message_id: string;

  @Column({ length: 50 })
  name: string;

  @Column('json')
  attributes: CommunicationWhatsappTemplateAttributesDto;

  @Column('json')
  template_config: TemplateState; // main

  @Column('json')
  webhook_response: any;

  @Column()
  business_id: number;

  @Column()
  language_id: number;

  @Column()
  category_id: number;

  @Column()
  status_id: number;

  @Column()
  csv_url: string;

  /** all related methods to go below this */
  @ManyToOne(() => BusinessEntity) @JoinColumn({ name: 'business_id' }) business: BusinessEntity;
  @ManyToOne(() => SystemLanguageEntity) @JoinColumn({ name: 'language_id' }) language: SystemLanguageEntity;

  @ManyToOne(() => LookupValueEntity) @JoinColumn({ name: 'category_id' }) category: LookupValueEntity;
  @ManyToOne(() => LookupValueEntity) @JoinColumn({ name: 'status_id' }) status: LookupValueEntity;
}
