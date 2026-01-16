import { CommonEntity, LookupValueEntity } from '@servicelabsco/nestjs-utility-services';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TeamInboxAttributesDto } from '../dtos/team.inbox.attributes.dto';
import { TeamInboxStatusTypeEnum } from '../enums/team.inbox.status.type.enum';
import { BusinessEntity } from './business.entity';
import { CommunicationBusinessUserEntity } from './communication.business.user.entity';
import { ContactEntity } from './contact.entity';

/**
 * entity definition against the bz_team_inbox table
 * @export
 * @class TeamInboxEntity
 * @extends {CommonEntity}
 */
@Entity('bz_team_inbox')
export class TeamInboxEntity extends CommonEntity {
  @Column()
  business_id: number;

  @Column()
  contact_id: number;

  @Column()
  status_id: TeamInboxStatusTypeEnum;

  @Column()
  facebook_conversation_identifier: string;

  @Column()
  active: boolean;

  @Column()
  only_broadcast: boolean;

  @Column()
  is_favorite: boolean;

  @Column()
  is_blocked: boolean;

  @Column()
  expired_at: Date;

  @Column()
  last_activity_at: Date;

  @Column()
  last_replied_at: Date;

  @Column()
  assignee_id: number;

  @Column('json')
  attributes: TeamInboxAttributesDto;

  /** all related methods to go below this */
  @ManyToOne(() => BusinessEntity) @JoinColumn({ name: 'business_id' }) business: BusinessEntity;
  @ManyToOne(() => LookupValueEntity) @JoinColumn({ name: 'status_id' }) status: LookupValueEntity;
  @ManyToOne(() => ContactEntity) @JoinColumn({ name: 'contact_id' }) contact: ContactEntity;
  @ManyToOne(() => CommunicationBusinessUserEntity) @JoinColumn({ name: 'assignee_id' }) assignee: CommunicationBusinessUserEntity;
}
