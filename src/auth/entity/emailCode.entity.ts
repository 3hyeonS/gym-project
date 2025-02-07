import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'emailCode' })
export class EmailCodeEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'code' })
  code: string;
}
