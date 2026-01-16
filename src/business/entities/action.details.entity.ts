import { CommonEntity, LookupValueEntity } from '@servicelabsco/nestjs-utility-services';
import { Column, Entity, JoinColumn, ManyToMany } from 'typeorm';
import { ActionDetailsAttributesDto } from '../dtos/action.details.attributes.dto';
import { BusinessEntity } from './business.entity';

/**
 * entity definition against the bz_action_details table
 * @export
 * @class ActionDetailsEntity
 * @extends {CommonEntity}
 */
@Entity('bz_action_details')
export class ActionDetailsEntity extends CommonEntity {
  @Column()
  name: string;

  @Column()
  business_id: number;

  @Column()
  type_id: number;

  @Column()
  active: boolean;

  @Column('json')
  parameters: any;

  @Column('json')
  attributes: ActionDetailsAttributesDto;

  /** all related methods to go below this */

  @ManyToMany(() => BusinessEntity) @JoinColumn({ name: 'business_id' }) business: BusinessEntity;
  @ManyToMany(() => LookupValueEntity) @JoinColumn({ name: 'type_id' }) type: LookupValueEntity;
}
