import { Column, Entity, OneToMany } from 'typeorm';
import { MemberEntity, MemberRole, TRole } from './member.entity';
import { RefreshTokenEntity } from './refreshToken.entity';

@Entity({ name: 'center' })
export class CenterEntity extends MemberEntity {
  @Column({ type: 'varchar', name: 'centerName' })
  centerName: string;

  @Column({ type: 'varchar', name: 'ceoName' })
  ceoName: string;

  @Column({ type: 'varchar', name: 'businessId' })
  businessId: string;

  @Column({ type: 'varchar', name: 'phone' })
  phone: string;

  @Column({ type: 'varchar', name: 'address' })
  address: string;

  @Column({
    type: 'enum',
    name: 'role',
    enum: MemberRole,
    default: 'CENTER',
  })
  role: TRole;

  @OneToMany(() => RefreshTokenEntity, (refreshToken) => refreshToken.center)
  refreshTokens: RefreshTokenEntity[];
}
