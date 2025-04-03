import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RefreshTokenEntity } from './refreshToken.entity';
import { SignWithEntity } from './signWith.entity';
import { AuthorityEntity } from './authority.entity';
import { KakaoKeyEntity } from './kakaoKey.entity';
import { AppleKeyEntity } from './appleKey.entity';

@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'nickname', nullable: false })
  nickname: string;

  @Column({ type: 'varchar', name: 'email', nullable: false })
  email: string;

  @ManyToOne(() => SignWithEntity, (signWith) => signWith.platform, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  signWith: SignWithEntity;

  @OneToOne(() => KakaoKeyEntity, (kakaoKey) => kakaoKey.user, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  kakaoKey: KakaoKeyEntity;

  @OneToOne(() => AppleKeyEntity, (appleKey) => appleKey.user, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  appleKey: AppleKeyEntity;

  @ManyToOne(() => AuthorityEntity, (authority) => authority.role, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  authority: AuthorityEntity;

  @OneToMany(() => RefreshTokenEntity, (refreshToken) => refreshToken.user, {
    nullable: true,
    eager: true,
    cascade: true,
  })
  refreshTokens: RefreshTokenEntity[];
}
