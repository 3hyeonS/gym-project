import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'kakaoKey' })
export class KakaoKeyEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'int', name: 'key', nullable: false, unique: true })
  kakaoId: number;

  @OneToOne(() => UserEntity, (user) => user.kakaoKey, {
    nullable: false,
    cascade: true,
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
