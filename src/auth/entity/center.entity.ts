import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { MemberEntity, MemberRole, TRole } from './member.entity';
import { RefreshTokenEntity } from './refreshToken.entity';
import { GymEntity } from 'src/gyms/entity/gyms.entity';
import { ExpiredGymEntity } from 'src/gyms/entity/expiredGyms.entity';
import { Gym2Entity } from 'src/gyms/entity/gyms2.entity';

@Entity({ name: 'center' })
export class CenterEntity extends MemberEntity {
  @Column({ type: 'varchar', name: 'centerName', nullable: false })
  centerName: string;

  @Column({ type: 'varchar', name: 'ceoName', nullable: false })
  ceoName: string;

  @Column({
    type: 'varchar',
    name: 'businessId',
    unique: true,
    nullable: false,
  })
  businessId: string;

  @Column({ type: 'varchar', name: 'email', unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', name: 'phone', nullable: false })
  phone: string;

  @Column({ type: 'varchar', name: 'address', nullable: false })
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

  @OneToOne(() => Gym2Entity, (gym2) => gym2.center, {
    nullable: true,
  })
  gym2: GymEntity;

  @OneToMany(() => ExpiredGymEntity, (expiredGyms) => expiredGyms.center, {
    nullable: true,
  })
  expiredGyms: ExpiredGymEntity[];
}
