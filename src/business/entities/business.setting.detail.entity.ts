import { CommonEntity } from '@servicelabsco/nestjs-utility-services';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BusinessSettingDetailAttributesDto } from '../dtos/business.setting.detail.attributes.dto';
import { BusinessEntity } from './business.entity';
import { SetBusinessSettingsDto } from '../dtos/set.business.settings.dto';

/**
 * entity definition against the bz_business_settings table
 * @export
 * @class BusinessSettingDetailEntity
 * @extends {CommonEntity}
 */
@Entity('bz_business_settings')
export class BusinessSettingDetailEntity extends CommonEntity {
  @Column()
  business_id: number;

  @Column()
  is_private_number: boolean;

  @Column('json')
  user_reminder_preference: SetBusinessSettingsDto['user_reminder_preference'];

  @Column('json')
  attributes: BusinessSettingDetailAttributesDto;

  /** all related methods to go below this */
  @ManyToOne(() => BusinessEntity) @JoinColumn({ name: 'business_id' }) business: BusinessEntity;
}
