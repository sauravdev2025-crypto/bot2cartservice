import { CommonEntity } from '@servicelabsco/nestjs-utility-services';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ChatbotRawJsonPayloadDto } from '../dtos/chatbot.raw.json.payload.dto';
import { BusinessEntity } from './business.entity';
import { ChatbotVersionEntity } from './chatbot.version.entity';

/**
 * entity definition against the bz_chatbot_flows table
 * @export
 * @class ChatbotDetailEntity
 * @extends {CommonEntity}
 */
@Entity('bz_chatbot_details')
export class ChatbotDetailEntity extends CommonEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  business_id: number;

  @Column()
  version_id: number;

  @Column()
  active: boolean;

  @Column('json')
  raw_react_flow: ChatbotRawJsonPayloadDto;

  @Column('json')
  attributes: any;

  /** all related methods to go below this */
  @ManyToOne(() => BusinessEntity) @JoinColumn({ name: 'business_id' }) business: BusinessEntity;
  @ManyToOne(() => ChatbotVersionEntity) @JoinColumn({ name: 'version_id' }) version: ChatbotVersionEntity;
}
