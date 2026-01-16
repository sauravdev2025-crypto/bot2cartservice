import { CommonEntity } from '@servicelabsco/nestjs-utility-services';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ChatbotNodesEntity } from '../../utility/entities/chatbot.nodes.entity';
import { ChatbotConnectedNodeAttributesDto } from '../dtos/chatbot.connected.node.attributes.dto';
import { ChatbotNode } from '../dtos/chatbot.raw.json.payload.dto';
import { BusinessEntity } from './business.entity';
import { ChatbotDetailEntity } from './chatbot.detail.entity';
import { ChatbotVersionEntity } from './chatbot.version.entity';

/**
 * entity definition against the bz_chatbot_connected_nodes table
 * @export
 * @class ChatbotConnectedNodeEntity
 * @extends {CommonEntity}
 */
@Entity('bz_chatbot_connected_nodes')
export class ChatbotConnectedNodeEntity extends CommonEntity {
  @Column()
  identifier: string;

  @Column()
  business_id: number;

  // @Column()
  // chatbot_id: number;

  @Column()
  chatbot_version_id: number;

  @Column()
  node_id: number;

  @Column('json')
  payload: ChatbotNode;

  @Column('json')
  attributes: ChatbotConnectedNodeAttributesDto;

  /** all related methods to go below this */
  @ManyToOne(() => BusinessEntity) @JoinColumn({ name: 'business_id' }) business: BusinessEntity;
  // @ManyToOne(() => ChatbotDetailEntity) @JoinColumn({ name: 'chatbot_id' }) chatbot: ChatbotDetailEntity;
  @ManyToOne(() => ChatbotDetailEntity) @JoinColumn({ name: 'chatbot_version_id' }) chatbot_version: ChatbotVersionEntity;
  @ManyToOne(() => ChatbotNodesEntity) @JoinColumn({ name: 'node_id' }) node: ChatbotNodesEntity;
}
