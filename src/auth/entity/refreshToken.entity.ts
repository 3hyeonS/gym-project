import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { CenterEntity } from './center.entity';

@Entity('refreshTokens')
export class RefreshTokenEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'token' })
  token: string;

  @Column({ type: 'varchar', name: 'signId' })
  signId: string;

  @Column({ type: 'datetime', name: 'expiresAt' })
  expiresAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.refreshTokens, { nullable: true })
  user: UserEntity;

  @ManyToOne(() => CenterEntity, (center) => center.refreshTokens, {
    nullable: true,
  })
  center: CenterEntity;

  @CreateDateColumn({ type: 'datetime', name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime', name: 'updateAt' })
  updatedAt: Date;
}
