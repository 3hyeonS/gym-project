import { Column, Entity } from 'typeorm';
import { MemberEntity, MemberRole, TRole } from './member.entity';

@Entity({ name: 'user' })
export class UserEntity extends MemberEntity {
  @Column({ type: 'varchar', name: 'userName' })
  userName: string;

  @Column({
    type: 'enum',
    name: 'role',
    enum: MemberRole,
    default: 'USER',
  })
  role: TRole;
}
