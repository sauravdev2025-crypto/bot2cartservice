import { CommonEntity } from '@servicelabsco/nestjs-utility-services';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { QuickReplyAttributesDto } from '../dtos/quick.reply.attributes.dto';
import { BusinessEntity } from './business.entity';

/**
 * entity definition against the bz_quick_replies table
 * @export
 * @class QuickReplyEntity
 * @extends {CommonEntity}
 */
@Entity('bz_quick_replies')
export class QuickReplyEntity extends CommonEntity {
  @Column()
  name: string;

  @Column()
  business_id: number;

  @Column()
  shortcut: string;

  @Column()
  message: string;

  @Column('json')
  document: any;

  @Column()
  active: boolean;

  @Column('json')
  attributes: QuickReplyAttributesDto;

  /** all related methods to go below this */
  @ManyToOne(() => BusinessEntity) @JoinColumn({ name: 'business_id' }) business: BusinessEntity;
}
