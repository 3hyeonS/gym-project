import { CenterEntity } from 'src/auth/entity/center.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BookmarkEntity } from './bookmark.entity';
import { VillyEntity } from './villy.entity';

@Entity({ name: 'recruitment' })
export class RecruitmentEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'centerName', nullable: false })
  centerName: string;

  @Column({ type: 'varchar', name: 'city', nullable: false })
  city: string;

  @Column({ type: 'varchar', name: 'location', nullable: false })
  location: string;

  @Column({ type: 'varchar', name: 'address', nullable: false })
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
  site: Record<string, string[]>;

  @Column({ type: 'text', name: 'description', nullable: true })
  description: string;

  @Column({ type: 'json', name: 'image', nullable: true })
  image: string[];

  @Column({ type: 'int', name: 'view', nullable: false, default: 0 })
  view: number;

  @Column({ type: 'tinyint', name: 'apply', nullable: true })
  apply: number;

  @Column({ type: 'date', name: 'date', nullable: false })
  date: Date;

  @Column({ type: 'tinyint', name: 'isHiring', nullable: false, default: 1 })
  isHiring: number;

  @ManyToOne(() => CenterEntity, (center) => center.recruitments, {
    eager: true,
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  center: CenterEntity;

  @OneToMany(() => BookmarkEntity, (bookmark) => bookmark.recruitment, {
    nullable: true,
    cascade: true,
  })
  bookmarks: BookmarkEntity[];

  @OneToMany(() => VillyEntity, (villy) => villy.recruitment, {
    nullable: true,
    cascade: true,
  })
  villies: VillyEntity[];
}
