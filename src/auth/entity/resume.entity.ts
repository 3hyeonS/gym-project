import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'resume' })
export class ResumeEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'name', nullable: false })
  name: string;

  @Column({ type: 'date', name: 'birth', nullable: false })
  birth: Date;

  @Column({ type: 'varchar', name: 'location', nullable: true })
  location: string;

  @Column({ type: 'varchar', name: 'address', nullable: true })
  address: string;

  @Column({ type: 'json', name: 'workType', nullable: false })
  workType: string[];

  @Column({ type: 'json', name: 'workTime', nullable: false })
  workTime: string[];

  @Column({ type: 'tinyint', name: 'weekendDuty', nullable: false })
  weekendDuty: number;

  @Column({ type: 'tinyint', name: 'gender', nullable: false })
  gender: number;

  @Column({ type: 'json', name: 'salary', nullable: false })
  salary: string[];

  @Column({ type: 'int', name: 'maxClassFee', nullable: false })
  maxClassFee: number;

  @Column({ type: 'json', name: 'basePay', nullable: true })
  basePay: number[];

  @Column({ type: 'json', name: 'classPay', nullable: true })
  classPay: number[];

  @Column({ type: 'json', name: 'classFee', nullable: true })
  classFee: number[];

  @Column({ type: 'json', name: 'monthly', nullable: true })
  monthly: number[];

  @Column({ type: 'json', name: 'hourly', nullable: true })
  hourly: number[];

  @Column({ type: 'json', name: 'welfare', nullable: false })
  welfare: string[];

  @Column({ type: 'json', name: 'qualifications', nullable: false })
  qualification: string[];

  @Column({ type: 'json', name: 'preference', nullable: false })
  preference: string[];

  @Column({ type: 'json', name: 'site', nullable: false })
  site: string[];

  @Column({ type: 'date', name: 'date', nullable: false })
  date: Date;

  @Column({ type: 'text', name: 'description', nullable: true })
  description: string;

  @Column({ type: 'json', name: 'image', nullable: true })
  image: string[];

  @Column({ type: 'int', name: 'view', nullable: false, default: 0 })
  view: number;

  @Column({ type: 'tinyint', name: 'apply', nullable: true })
  apply: number;
}
