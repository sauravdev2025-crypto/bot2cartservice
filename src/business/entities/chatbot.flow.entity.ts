import { CommonEntity } from '@servicelabsco/nestjs-utility-services';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ChatbotFlowAttributesDto } from '../dtos/chatbot.flow.attributes.dto';
import { BusinessEntity } from './business.entity';
import { ChatbotDetailEntity } from './chatbot.detail.entity';
import { ChatbotFlowStepEntity } from './chatbot.flow.step.entity';
import { ChatbotVersionEntity } from './chatbot.version.entity';
import { TeamInboxEntity } from './team.inbox.entity';

/**
 * entity definition against the bz_chatbot_flow table
 * @export
 * @class ChatbotFlowEntity
 * @extends {CommonEntity}
 */
@Entity('bz_chatbot_flow')
export class ChatbotFlowEntity extends CommonEntity {
  @Column()
  business_id: number;

  @Column()
  team_inbox_id: number;

  // @Column()
  // chatbot_id: number;

  @Column()
  chatbot_version_id: number;

  @Column()
  next_step_id: number;

  @Column()
  active: boolean;

  @Column()
  node_expires_at: Date;

  @Column()
  start_time: Date;

  @Column()
  end_time: Date;

  @Column('json')
  variables: any;

  @Column('json')
  attributes: ChatbotFlowAttributesDto;

  /** all related methods to go below this */
  @ManyToOne(() => BusinessEntity) @JoinColumn({ name: 'business_id' }) business: BusinessEntity;
  // @ManyToOne(() => ChatbotDetailEntity) @JoinColumn({ name: 'chatbot_id' }) chatbot: ChatbotDetailEntity;
  @ManyToOne(() => ChatbotDetailEntity) @JoinColumn({ name: 'chatbot_version_id' }) chatbot_version: ChatbotVersionEntity;
  @ManyToOne(() => ChatbotFlowStepEntity) @JoinColumn({ name: 'next_step_id' }) nest_step: ChatbotFlowStepEntity;
  @ManyToOne(() => TeamInboxEntity) @JoinColumn({ name: 'team_inbox_id' }) team_inbox: TeamInboxEntity;
}
