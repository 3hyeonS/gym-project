import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'emailCode' })
export class EmailCodeEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'email', nullable: false })
  email: string;

  @Column({ type: 'varchar', name: 'code', nullable: false })
  code: string;

  @CreateDateColumn({ type: 'datetime', name: 'createdAt', nullable: false })
  createdAt: Date;

  @Column({ type: 'datetime', name: 'expiresAt', nullable: false })
  expiresAt: Date;
}
