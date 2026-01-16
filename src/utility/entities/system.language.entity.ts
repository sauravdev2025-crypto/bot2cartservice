import { Column, Entity } from 'typeorm';
import { CommonEntity } from '@servicelabsco/nestjs-utility-services';
import { SystemLanguageAttributesDto } from '../dtos/system.language.attributes.dto';

/**
 * entity definition against the sys_languages table
 * @export
 * @class SystemLanguageEntity
 * @extends {CommonEntity}
 */
@Entity('sys_languages')
export class SystemLanguageEntity extends CommonEntity {
  @Column()
  name: string;

  @Column()
  code: string;

  @Column('json')
  attributes: SystemLanguageAttributesDto;

  /** all related methods to go below this */
}
