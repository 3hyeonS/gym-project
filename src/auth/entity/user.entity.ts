import { Column, Entity, OneToMany } from 'typeorm';
import { MemberEntity, MemberRole, TRole } from './member.entity';
import { RefreshTokenEntity } from './refreshToken.entity';

export type TSignWith = 'LOCAL' | 'KAKAO' | 'APPLE';

export const SignWith = {
  LOCAL: 'LOCAL',
  KAKAO: 'KAKAO',
  APPLE: 'APPLE',
} as const;

@Entity({ name: 'user' })
export class UserEntity extends MemberEntity {
  @Column({ type: 'varchar', name: 'nickname', nullable: false })
  nickname: string;

  @Column({ type: 'varchar', name: 'email', nullable: false })
  email: string;

  @Column({
    type: 'enum',
    name: 'signWith',
    enum: SignWith,
    default: 'LOCAL',
  })
  signWith: TSignWith;

  @Column({
    type: 'enum',
    name: 'role',
    enum: MemberRole,
    default: 'USER',
  })
  role: TRole;

  // user.entity.ts
  @OneToMany(() => RefreshTokenEntity, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshTokenEntity[];
}
