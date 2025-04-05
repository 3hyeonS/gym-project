import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'appleKey' })
export class AppleKeyEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'key', nullable: false, unique: true })
  appleId: string;

  @Column({
    type: 'varchar',
    name: 'appleRefreshToken',
    nullable: false,
    unique: true,
  })
  appleRefreshToken: string;

  @OneToOne(() => UserEntity, (user) => user.kakaoKey, {
    nullable: false,
    cascade: true,
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
