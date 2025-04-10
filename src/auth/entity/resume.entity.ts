import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { CareerEntity } from './career.entity';

@Entity({ name: 'resume' })
export class ResumeEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'name', nullable: false })
  name: string;

  @Column({ type: 'date', name: 'birth', nullable: false })
  birth: Date;

  @Column({ type: 'varchar', name: 'phone', nullable: false })
  phone: string;

  @Column({ type: 'varchar', name: 'email', nullable: false })
  email: string;

  @Column({ type: 'tinyint', name: 'gender', nullable: false })
  gender: number;

  @Column({ type: 'json', name: 'location', nullable: false })
  location: Record<string, string[]>;

  @Column({ type: 'tinyint', name: 'isNew', nullable: false })
  isNew: number;

  @Column({ type: 'json', name: 'workType', nullable: true })
  workType: string[];

  @Column({ type: 'json', name: 'workTime', nullable: true })
  workTime: string[];

  @Column({ type: 'tinyint', name: 'lisence', nullable: true })
  lisence: number;

  @Column({ type: 'json', name: 'award', nullable: true })
  award: string[];

  @Column({ type: 'json', name: 'portfolio', nullable: true })
  portfolio: string[];

  @Column({ type: 'text', name: 'introduction', nullable: true })
  intruduction: string;

  @OneToMany(() => CareerEntity, (career) => career.resume, {
    eager: true,
    nullable: true,
    cascade: true,
  })
  careers: CareerEntity[];
}
