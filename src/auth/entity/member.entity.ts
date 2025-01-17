import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type TRole = 'ADMIN' | 'USER' | 'CENTER';

export const MemberRole = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  CENTER: 'CENTER',
} as const;

@Entity()
export class MemberEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'signId', unique: true })
  signId: string;

  @Column({ type: 'varchar', name: 'email' })
  email: string;

  @Column({ type: 'varchar', name: 'password' })
  password: string;

  @Column({
    type: 'enum',
    name: 'role',
    enum: MemberRole,
  })
  role: TRole;
}
