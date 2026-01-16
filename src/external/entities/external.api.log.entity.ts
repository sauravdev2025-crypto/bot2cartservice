import { CommonEntity } from '@servicelabsco/nestjs-utility-services';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BusinessEntity } from '../../business/entities/business.entity';
import { CommunicationApiAccountEntity } from '../../business/entities/communication.api.account.entity';
import { ExternalApiLogAttributesDto } from '../dtos/external.api.log.attributes.dto';

/**
 * entity definition against the external_api_logs table
 * @export
 * @class ExternalApiLogEntity
 * @extends {CommonEntity}
 */
@Entity('external_api_logs')
export class ExternalApiLogEntity extends CommonEntity {
  @Column()
  business_id: number;

  @Column()
  api_account_id: number;

  @Column()
  is_incoming: boolean;

  @Column('json')
  request: any;

  @Column('json')
  response: any;

  @Column('json')
  attributes: ExternalApiLogAttributesDto;

  /** all related methods to go below this */
  @ManyToOne(() => BusinessEntity) @JoinColumn({ name: 'business_id' }) business: BusinessEntity;
  @ManyToOne(() => CommunicationApiAccountEntity) @JoinColumn({ name: 'api_account_id' }) api_account: CommunicationApiAccountEntity;
}
