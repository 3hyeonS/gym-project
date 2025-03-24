import { CenterEntity } from 'src/auth/entity/center.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type TApply = 'EMAIL' | 'PHONE' | 'BOTH';

@Entity({ name: 'gymList' })
export class GymEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'text', name: 'centerName', nullable: false })
  centerName: string;

  @Column({ type: 'text', name: 'city', nullable: false })
  city: string;

  @Column({ type: 'json', name: 'location', nullable: false })
  location: string[];

  @Column({ type: 'json', name: 'subway', nullable: true })
  subway: string[];

  @Column({ type: 'json', name: 'workType', nullable: false })
  workType: string[];

  @Column({ type: 'json', name: 'workTime', nullable: false })
  workTime: string[];

  @Column({ type: 'json', name: 'workDays', nullable: false })
  workDays: string[];

  @Column({ type: 'json', name: 'weekendDuty', nullable: false })
  weekendDuty: string[];

  @Column({ type: 'json', name: 'salary', nullable: false })
  salary: string[];

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

  @Column({ type: 'int', name: 'maxClassFee', nullable: false })
  maxClassFee: number;

  @Column({ type: 'json', name: 'gender', nullable: false })
  gender: string[];

  @Column({ type: 'json', name: 'qualifications', nullable: false })
  qualifications: string[];

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

  @Column({
    type: 'set',
    name: 'apply',
    enum: ['EMAIL', 'PHONE', 'BOTH'],
    nullable: true,
  })
  apply: TApply[];

  @OneToOne(() => CenterEntity, (center) => center.gym, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'centerId' }) // GymEntity 테이블에 FK가 생성됨
  center: CenterEntity;

  @Column({ type: 'int', name: 'view', nullable: false, default: 0 })
  view: number;
}
