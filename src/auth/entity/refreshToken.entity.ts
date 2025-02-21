import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { CenterEntity } from './center.entity';

@Entity('refreshTokens')
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'token', unique: true, nullable: false })
  token: string;

  @Column({ type: 'varchar', name: 'signId', nullable: false })
  signId: string;

  @ManyToOne(() => UserEntity, (user) => user.refreshTokens, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  user: UserEntity;

  @ManyToOne(() => CenterEntity, (center) => center.refreshTokens, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  center: CenterEntity;

  @CreateDateColumn({ type: 'datetime', name: 'createdAt', nullable: false })
  createdAt: Date;

  @Column({ type: 'datetime', name: 'expiresAt', nullable: false })
  expiresAt: Date;
}
