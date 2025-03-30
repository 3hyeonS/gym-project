import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type TRole = 'CENTER' | 'USER' | 'ADMIN';

@Entity({ name: 'authority' })
export class AuthorityEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'role', nullable: false })
  role: TRole;
}
