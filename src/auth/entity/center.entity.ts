import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { MemberEntity, MemberRole, TRole } from './member.entity';
import { RefreshTokenEntity } from './refreshToken.entity';
import { GymEntity } from 'src/gyms/entity/gyms.entity';
import { ExpiredGymEntity } from 'src/gyms/entity/expiredGyms.entity';

@Entity({ name: 'center' })
export class CenterEntity extends MemberEntity {
  @Column({ type: 'varchar', name: 'centerName' })
  centerName: string;

  @Column({ type: 'varchar', name: 'ceoName' })
  ceoName: string;

  @Column({ type: 'varchar', name: 'businessId', unique: true })
  businessId: string;

  @Column({ type: 'varchar', name: 'phone' })
  phone: string;

  @Column({ type: 'varchar', name: 'address' })
  address: string;

  @Column({
    type: 'enum',
    name: 'role',
    enum: MemberRole,
    default: 'CENTER',
  })
  role: TRole;

  @OneToMany(() => RefreshTokenEntity, (refreshTokens) => refreshTokens.center)
  refreshTokens: RefreshTokenEntity[];

  @OneToOne(() => GymEntity, (gym) => gym.center, {
    nullable: true,
  })
  gym: GymEntity;

  @OneToMany(() => ExpiredGymEntity, (expiredGyms) => expiredGyms.center, {
    nullable: true,
  })
  expiredGyms: ExpiredGymEntity[];
}
