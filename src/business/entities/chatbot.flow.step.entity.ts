import { CommonEntity } from '@servicelabsco/nestjs-utility-services';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ChatbotFlowStepAttributesDto } from '../dtos/chatbot.flow.step.attributes.dto';
import { ChatbotConnectedNodeEntity } from './chatbot.connected.node.entity';
import { ChatbotFlowEntity } from './chatbot.flow.entity';

/**
 * entity definition against the bz_chatbot_flow_steps table
 * @export
 * @class ChatbotFlowStepEntity
 * @extends {CommonEntity}
 */
@Entity('bz_chatbot_flow_steps')
export class ChatbotFlowStepEntity extends CommonEntity {
  @Column()
  flow_id: number;

  @Column()
  node_id: number;

  @Column()
  start_time: Date;

  @Column()
  end_time: Date;

  @Column('json')
  payload: any;

  @Column('json')
  attributes: ChatbotFlowStepAttributesDto;

  /** all related methods to go below this */
  @ManyToOne(() => ChatbotFlowEntity) @JoinColumn({ name: 'flow_id' }) flow: ChatbotFlowEntity;
  @ManyToOne(() => ChatbotConnectedNodeEntity) @JoinColumn({ name: 'node_id' }) node: ChatbotConnectedNodeEntity;
}
