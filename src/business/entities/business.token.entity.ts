import { CommonEntity } from '@servicelabsco/nestjs-utility-services';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CommunicationUserEntity } from '../../utility/entities/communication.user.entity';
import { BusinessEntity } from './business.entity';

/**
 * entity definition against the bz_business_tokens table
 * @export
 * @class BusinessTokenEntity
 * @extends {CommonEntity}
 */
@Entity('bz_business_tokens')
export class BusinessTokenEntity extends CommonEntity {
  @Column()
  business_id: number;

  @Column()
  user_id: number;

  @Column()
  token: number;

  @Column()
  expired_at: Date;

  @Column()
  validated_at: Date;

  @Column('json')
  attributes: any;

  /** all related methods to go below this */
  @ManyToOne(() => BusinessEntity)
  @JoinColumn({ name: 'business_id' })
  business: BusinessEntity;

  @ManyToOne(() => CommunicationUserEntity)
  @JoinColumn({ name: 'user_id' })
  alias: CommunicationUserEntity;
}
