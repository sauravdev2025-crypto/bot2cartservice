import { CommonEntity } from '@servicelabsco/nestjs-utility-services';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { KeywordActionTriggerDetailAttributesDto } from '../dtos/keyword.action.trigger.detail.attributes.dto';
import { BusinessEntity } from './business.entity';
import { KeywordActionDetailEntity } from './keyword.action.detail.entity';

/**
 * entity definition against the bz_keyword_action_trigger_details table
 * @export
 * @class KeywordActionTriggerDetailEntity
 * @extends {CommonEntity}
 */
@Entity('bz_keyword_action_trigger_details')
export class KeywordActionTriggerDetailEntity extends CommonEntity {
  @Column()
  business_id: number;

  @Column()
  keyword_action_id: number;

  @Column()
  is_success: boolean;

  @Column()
  initiated_at: Date;

  @Column('json')
  attributes: KeywordActionTriggerDetailAttributesDto;

  /** all related methods to go below this */
  @ManyToOne(() => BusinessEntity) @JoinColumn({ name: 'business_id' }) business: BusinessEntity;
  @ManyToOne(() => KeywordActionDetailEntity) @JoinColumn({ name: 'keyword_action_id' }) keyword_action: KeywordActionDetailEntity;
}
