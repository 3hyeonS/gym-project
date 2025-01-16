import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type TRole = 'ADMIN' | 'USER';

export const UserRole = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'userName' })
  userName: string;

  @Column({ type: 'varchar', name: 'password' })
  password: string;

  @Column({ type: 'varchar', name: 'email', unique: true })
  email: string;

  @Column({
    type: 'enum',
    name: 'role',
    enum: UserRole,
  })
  role: TRole;

  // @Column({ type:'varchar', name:'[postalCode]' })
  // postalCode: string;

  // @Column({ type:'varchar', name:'address' })
  // address: string;

  // @Column({ type:'varchar', name:'detailAddress' })
  // detailAddress: string;
}
