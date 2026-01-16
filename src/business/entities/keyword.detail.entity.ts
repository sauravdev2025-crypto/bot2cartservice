import { CommonEntity, LookupValueEntity } from '@servicelabsco/nestjs-utility-services';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { KeywordDetailAttributesDto } from '../dtos/keyword.detail.attributes.dto';
import { KeywordMatchingTypeEnum } from '../enums/keyword.matching.type.enum';
import { BusinessEntity } from './business.entity';
import { ActionDetailsEntity } from './action.details.entity';
import { KeywordActionDetailEntity } from './keyword.action.detail.entity';

/**
 * entity definition against the bz_keyword_details table
 * @export
 * @class KeywordDetailEntity
 * @extends {CommonEntity}
 */
@Entity('bz_keyword_details')
export class KeywordDetailEntity extends CommonEntity {
  @Column()
  name: string;

  @Column()
  business_id: number;

  @Column('json')
  keywords: string[];

  @Column()
  matching_type_id: KeywordMatchingTypeEnum;

  @Column()
  active: boolean;

  @Column('json')
  attributes: KeywordDetailAttributesDto;

  /** all related methods to go below this */
  @ManyToOne(() => BusinessEntity) @JoinColumn({ name: 'business_id' }) business: BusinessEntity;
  @ManyToOne(() => LookupValueEntity) @JoinColumn({ name: 'matching_type_id' }) matching_type: LookupValueEntity;

  @OneToMany(() => KeywordActionDetailEntity, (actions) => actions.keyword) actions: KeywordActionDetailEntity[];
}
