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
    eager: true,
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  signWith: SignWithEntity;

  @OneToOne(() => KakaoKeyEntity, (kakaoKey) => kakaoKey.user, {
    eager: true,
    cascade: true,
    nullable: true,
  })
  kakaoKey: KakaoKeyEntity;

  @OneToOne(() => AppleKeyEntity, (appleKey) => appleKey.user, {
    eager: true,
    cascade: true,
    nullable: true,
  })
  appleKey: AppleKeyEntity;

  @ManyToOne(() => AuthorityEntity, (authority) => authority.role, {
    eager: true,
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  authority: AuthorityEntity;

  @OneToMany(() => RefreshTokenEntity, (refreshToken) => refreshToken.user, {
    nullable: true,
    cascade: true,
  })
  refreshTokens: RefreshTokenEntity[];
}
