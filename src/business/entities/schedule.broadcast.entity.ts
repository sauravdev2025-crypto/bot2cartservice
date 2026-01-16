import { CommonEntity } from '@servicelabsco/nestjs-utility-services';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ScheduleBroadcastAttributesDto } from '../dtos/schedule.broadcast.attributes.dto';
import { BusinessEntity } from './business.entity';
import { CommunicationWhatsappTemplateEntity } from './communication.whatsapp.template.entity';

/**
 * entity definition against the bz_schedule_broadcast table
 * @export
 * @class ScheduleBroadcastEntity
 * @extends {CommonEntity}
 */
@Entity('bz_schedule_broadcast')
export class ScheduleBroadcastEntity extends CommonEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  business_id: number;

  @Column()
  template_id: number;

  @Column()
  csv: string;

  @Column()
  scheduled_at: Date;

  @Column()
  initiated_at: Date;

  @Column()
  completed_at: Date;

  @Column('json')
  attributes: ScheduleBroadcastAttributesDto;

  /** all related methods to go below this */
  @ManyToOne(() => BusinessEntity) @JoinColumn({ name: 'business_id' }) business: BusinessEntity;
  @ManyToOne(() => CommunicationWhatsappTemplateEntity) @JoinColumn({ name: 'template_id' }) template: CommunicationWhatsappTemplateEntity;
}
