import { Column, Entity, OneToMany } from 'typeorm';
import { MemberEntity, MemberRole, TRole } from './member.entity';
import { RefreshTokenEntity } from './refreshToken.entity';

@Entity({ name: 'user' })
export class UserEntity extends MemberEntity {
  @Column({ type: 'varchar', name: 'userName', nullable: false })
  userName: string;

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
