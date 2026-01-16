import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CommonEntity, LookupValueEntity } from '@servicelabsco/nestjs-utility-services';
import { IdentifierSerialAttributesDto } from '../dtos/identifier.serial.attributes.dto';

/**
 * entity definition against the utl_identifier_serials table
 * @export
 * @class IdentifierSerialEntity
 * @extends {CommonEntity}
 */
@Entity('utl_identifier_serials')
export class IdentifierSerialEntity extends CommonEntity {
  @Column()
  prefix_id: number;

  @Column()
  value: string;

  @Column('json')
  attributes: IdentifierSerialAttributesDto;

  /** all related methods to go below this */
  @ManyToOne(() => LookupValueEntity) @JoinColumn({ name: 'prefix_id' }) prefix: LookupValueEntity;
}
