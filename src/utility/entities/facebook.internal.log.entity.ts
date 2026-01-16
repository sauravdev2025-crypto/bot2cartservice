import { Column, Entity } from 'typeorm';
import { CommonEntity } from '@servicelabsco/nestjs-utility-services';
import { FacebookInternalLogAttributesDto } from '../dtos/facebook.internal.log.attributes.dto';

/**
 * entity definition against the sys_facebook_internal_logs table
 * @export
 * @class FacebookInternalLogEntity
 * @extends {CommonEntity}
 */
@Entity('sys_facebook_internal_logs')
export class FacebookInternalLogEntity extends CommonEntity {
  @Column()
  source_type: string;

  @Column()
  source_id: number;

  @Column()
  is_incoming: boolean;

  @Column('json')
  payload: any;

  @Column('json')
  response: any;

  @Column('json')
  webhook_response: any;

  @Column('json')
  attributes: FacebookInternalLogAttributesDto;

  /** all related methods to go below this */
}
