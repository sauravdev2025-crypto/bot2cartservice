import { CommonEntity } from '@servicelabsco/nestjs-utility-services';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ChatbotConnectedEdgesAttributesDto } from '../dtos/chatbot.connected.edges.attributes.dto';
import { ChatbotEdge } from '../dtos/chatbot.raw.json.payload.dto';
import { ChatbotConnectedNodeEntity } from './chatbot.connected.node.entity';
import { ChatbotDetailEntity } from './chatbot.detail.entity';
import { ChatbotVersionEntity } from './chatbot.version.entity';

/**
 * entity definition against the bz_chatbot_connected_edges table
 * @export
 * @class ChatbotConnectedEdgesEntity
 * @extends {CommonEntity}
 */
@Entity('bz_chatbot_connected_edges')
export class ChatbotConnectedEdgesEntity extends CommonEntity {
  // @Column()
  // chatbot_id: number;

  @Column()
  node_id: number;

  @Column()
  chatbot_version_id: number;

  @Column()
  connected_node_id: number;

  @Column()
  edge_id: string;

  @Column('json')
  payload: ChatbotEdge;

  @Column('json')
  attributes: ChatbotConnectedEdgesAttributesDto;

  /** all related methods to go below this */
  @ManyToOne(() => ChatbotConnectedNodeEntity) @JoinColumn({ name: 'node_id' }) node: ChatbotConnectedNodeEntity;
  @ManyToOne(() => ChatbotConnectedNodeEntity) @JoinColumn({ name: 'connected_node_id' }) connected_node: ChatbotConnectedNodeEntity;
  // @ManyToOne(() => ChatbotDetailEntity) @JoinColumn({ name: 'chatbot_id' }) chatbot: ChatbotDetailEntity;
  @ManyToOne(() => ChatbotDetailEntity) @JoinColumn({ name: 'chatbot_version_id' }) chatbot_version: ChatbotVersionEntity;
}
