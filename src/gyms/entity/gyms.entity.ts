import { CenterEntity } from 'src/auth/entity/center.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'gymList' })
export class GymEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'text', name: 'centerName' })
  centerName: string;

  @Column({ type: 'text', name: 'city' })
  city: string;

  @Column({ type: 'json', name: 'location' })
  location: string[];

  @Column({ type: 'json', name: 'subway', nullable: true })
  subway: string[];

  @Column({ type: 'json', name: 'workType' })
  workType: string[];

  @Column({ type: 'json', name: 'workTime' })
  workTime: string[];

  @Column({ type: 'json', name: 'workDays' })
  workDays: string[];

  @Column({ type: 'json', name: 'weekendDuty' })
  weekendDuty: string[];

  @Column({ type: 'json', name: 'salary' })
  salary: string[];

  // @Column({ type: 'json', name: 'salaryDetail' })
  // salaryDetail: Record<string, string>;

  @Column({ type: 'json', name: 'basePay', nullable: true })
  basePay: number[];

  @Column({ type: 'json', name: 'classPay', nullable: true })
  classPay: number[];

  @Column({ type: 'json', name: 'classFee', nullable: true })
  classFee: number[];

  @Column({ type: 'json', name: 'hourly', nullable: true })
  hourly: number[];

  @Column({ type: 'json', name: 'monthly', nullable: true })
  monthly: number[];

  @Column({ type: 'int', name: 'maxClassFee' })
  maxClassFee: number;

  @Column({ type: 'json', name: 'gender' })
  gender: string[];

  @Column({ type: 'json', name: 'qualifications' })
  qualifications: string[];

  @Column({ type: 'json', name: 'preference' })
  preference: string[];

  @Column({ type: 'json', name: 'site' })
  site: string[];

  @Column({ type: 'date', name: 'date' })
  date: Date;

  @Column({ type: 'text', name: 'description', nullable: true })
  description: string;

  @Column({ type: 'json', name: 'image', nullable: true })
  image: string[];

  @ManyToOne(() => CenterEntity, (center) => center.gym, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  center: CenterEntity;
}
