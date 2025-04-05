import { Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';
import { CenterEntity } from './center.entity';

export type TRole = 'CENTER' | 'USER' | 'ADMIN';

@Entity({ name: 'authority' })
export class AuthorityEntity {
  @PrimaryColumn({ type: 'varchar', name: 'role' })
  role: TRole;

  @OneToMany(() => UserEntity, (user) => user.authority, {
    nullable: true,
    cascade: true,
  })
  users: UserEntity[];

  @OneToMany(() => CenterEntity, (center) => center.authority, {
    nullable: true,
    cascade: true,
  })
  centers: CenterEntity[];
}
