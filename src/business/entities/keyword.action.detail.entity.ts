import { CommonEntity } from '@servicelabsco/nestjs-utility-services';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { KeywordActionDetailAttributesDto } from '../dtos/keyword.action.detail.attributes.dto';
import { ActionDetailsEntity } from './action.details.entity';
import { BusinessEntity } from './business.entity';
import { KeywordDetailEntity } from './keyword.detail.entity';

/**
 * entity definition against the bz_keyword_action_details table
 * @export
 * @class KeywordActionDetailEntity
 * @extends {CommonEntity}
 */
@Entity('bz_keyword_action_details')
export class KeywordActionDetailEntity extends CommonEntity {
  @Column()
  business_id: number;

  @Column()
  keyword_id: number;

  @Column()
  action_id: number;

  @Column()
  active: boolean;

  @Column('json')
  attributes: KeywordActionDetailAttributesDto;

  /** all related methods to go below this */
  @ManyToOne(() => BusinessEntity) @JoinColumn({ name: 'business_id' }) business: BusinessEntity;
  @ManyToOne(() => ActionDetailsEntity) @JoinColumn({ name: 'action_id' }) action: ActionDetailsEntity;
  @ManyToOne(() => KeywordDetailEntity) @JoinColumn({ name: 'keyword_id' }) keyword: KeywordDetailEntity;
}
