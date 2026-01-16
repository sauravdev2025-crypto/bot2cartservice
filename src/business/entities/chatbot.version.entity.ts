import { CommonEntity } from '@servicelabsco/nestjs-utility-services';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ChatbotRawJsonPayloadDto } from '../dtos/chatbot.raw.json.payload.dto';
import { ChatbotVersionAttributesDto } from '../dtos/chatbot.version.attributes.dto';
import { BusinessEntity } from './business.entity';
import { ChatbotDetailEntity } from './chatbot.detail.entity';

/**
 * entity definition against the bz_chatbot_versions table
 * @export
 * @class ChatbotVersionEntity
 * @extends {CommonEntity}
 */
@Entity('bz_chatbot_versions')
export class ChatbotVersionEntity extends CommonEntity {
  @Column()
  name: string;

  @Column()
  business_id: number;

  @Column()
  chatbot_id: number;

  @Column()
  published_at: Date;

  @Column('json')
  raw_react_flow: ChatbotRawJsonPayloadDto;

  @Column('json')
  attributes: ChatbotVersionAttributesDto;

  /** all related methods to go below this */
  @ManyToOne(() => BusinessEntity) @JoinColumn({ name: 'business_id' }) business: BusinessEntity;
  @ManyToOne(() => ChatbotDetailEntity) @JoinColumn({ name: 'chatbot_id' }) chatbot: ChatbotDetailEntity;
}
