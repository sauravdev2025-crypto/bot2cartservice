import { CommonEntity } from '@servicelabsco/nestjs-utility-services';
import { Column, Entity } from 'typeorm';
import { ChatbotNodesAttributesDto } from '../dtos/chatbot.nodes.attributes.dto';

/**
 * entity definition against the utl_chatbot_nodes table
 * @export
 * @class ChatbotNodesEntity
 * @extends {CommonEntity}
 */
@Entity('utl_chatbot_nodes')
export class ChatbotNodesEntity extends CommonEntity {
  @Column()
  identifier: string;

  @Column()
  title: string;

  @Column()
  sub_title: string;

  @Column()
  icon: string;

  @Column()
  description: string;

  @Column('json')
  style: string;

  @Column()
  type: string;

  @Column('json')
  attributes: ChatbotNodesAttributesDto;

  /** all related methods to go below this */
}
