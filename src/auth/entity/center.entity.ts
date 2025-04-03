import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RefreshTokenEntity } from './refreshToken.entity';
import { GymEntity } from 'src/gyms/entity/gyms.entity';
import { ExpiredGymEntity } from 'src/gyms/entity/expiredGyms.entity';
import { Gym2Entity } from 'src/gyms/entity/gyms2.entity';
import { AuthorityEntity } from './authority.entity';

@Entity({ name: 'center' })
export class CenterEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'signId', nullable: false, unique: true })
  signId: string;

  @Column({ type: 'varchar', name: 'password', nullable: false })
  password: string;

  @Column({
    type: 'varchar',
    name: 'centerName',
    nullable: false,
    unique: true,
  })
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

  @Column({ type: 'varchar', name: 'phone', nullable: false })
  phone: string;

  @Column({ type: 'varchar', name: 'email', nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', name: 'address', nullable: false })
  address: string;

  @ManyToOne(() => AuthorityEntity, (authority) => authority.role, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  authority: AuthorityEntity;

  @OneToMany(() => RefreshTokenEntity, (refreshToken) => refreshToken.center, {
    nullable: true,
    eager: true,
    cascade: true,
  })
  refreshTokens: RefreshTokenEntity[];

  @OneToOne(() => GymEntity, (gym) => gym.center, {
    nullable: true,
  })
  gym: GymEntity;

  @OneToOne(() => Gym2Entity, (gym2) => gym2.center, {
    nullable: true,
  })
  gym2: GymEntity;

  @OneToMany(() => ExpiredGymEntity, (expiredGym) => expiredGym.center, {
    nullable: true,
  })
  expiredGyms: ExpiredGymEntity[];
}
