import { CommonEntity } from '@servicelabsco/nestjs-utility-services';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BusinessUserInvitationAttributesDto } from '../dtos/business.user.invitation.attributes.dto';
import { BusinessEntity } from './business.entity';
import { RoleGroupEntity } from '@servicelabsco/slabs-access-manager';

/**
 * entity definition against the bz_user_invitations table
 * @export
 * @class BusinessUserInvitationEntity
 * @extends {CommonEntity}
 */
@Entity('bz_user_invitations')
export class BusinessUserInvitationEntity extends CommonEntity {
  @Column()
  email: string;

  @Column()
  business_id: number;

  @Column()
  role_id: number;

  @Column()
  accepted_at: Date;

  @Column()
  rejected_at: Date;

  @Column('json')
  attributes: BusinessUserInvitationAttributesDto;

  /** all related methods to go below this */
  @ManyToOne(() => BusinessEntity) @JoinColumn({ name: 'business_id' }) business: BusinessEntity;
  @ManyToOne(() => RoleGroupEntity) @JoinColumn({ name: 'role_id' }) role: RoleGroupEntity;
}
