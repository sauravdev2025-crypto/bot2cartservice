import { UserEntity } from '@servicelabsco/nestjs-utility-services';
import { BusinessUserEntity } from '@servicelabsco/slabs-access-manager';
import { Exclude } from 'class-transformer';
import { Column, Entity, OneToMany } from 'typeorm';

/**
 * entity definition against the sys_users table
 * @export
 * @class CommunicationUserEntity
 * @extends {CommonEntity}
 */
@Entity('sys_users')
export class CommunicationUserEntity extends UserEntity {
  @Column()
  last_login_at: Date;

  @Column()
  last_activity_at: Date;

  @Column()
  password_reset_at: Date;

  @Exclude({ toPlainOnly: true })
  auth_key: string;

  @Column()
  password_expires_at: Date;

  @Column()
  password_timeout_period: number;

  /** all related methods to go below this */
  @OneToMany(() => BusinessUserEntity, (business_user) => business_user.user)
  business_users: BusinessUserEntity[];
}
