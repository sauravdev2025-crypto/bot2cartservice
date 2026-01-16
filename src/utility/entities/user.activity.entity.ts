import { CommonEntity } from '@servicelabsco/nestjs-utility-services';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BusinessEntity } from '../../business/entities/business.entity';
import { CommunicationUserEntity } from './communication.user.entity';

/**
 * entity definition against the utl_user_activities table
 * @export
 * @class UserActivityEntity
 * @extends {CommonEntity}
 */
@Entity('utl_user_activities')
export class UserActivityEntity extends CommonEntity {
  @Column()
  user_id: number;

  @Column()
  business_id: number;

  @Column()
  activity: string;

  @Column()
  ip: string;

  @Column('json')
  user_agent: any;

  @Column()
  activity_at: Date;

  @Column()
  session_identifier: string;

  @Column('json')
  attributes: any;

  /** all related methods to go below this */
  @ManyToOne(() => CommunicationUserEntity)
  @JoinColumn({ name: 'user_id' })
  user: CommunicationUserEntity;

  @ManyToOne(() => BusinessEntity)
  @JoinColumn({ name: 'business_id' })
  business: BusinessEntity;
}
