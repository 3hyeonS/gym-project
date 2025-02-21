import { Column, PrimaryGeneratedColumn } from 'typeorm';

export type TRole = 'ADMIN' | 'USER' | 'CENTER';

export const MemberRole = {
  ADMIN: 'ADMIN',
  USER: 'USER',
  CENTER: 'CENTER',
} as const;

export class MemberEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'signId', unique: true, nullable: false })
  signId: string;

  @Column({ type: 'varchar', name: 'email', unique: true, nullable: false })
  email: string;

  @Column({ type: 'varchar', name: 'password', nullable: false })
  password: string;

  @Column({
    type: 'enum',
    name: 'role',
    enum: MemberRole,
  })
  role: TRole;
}
