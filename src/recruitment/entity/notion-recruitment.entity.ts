import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'notionRecruitment' })
export class NotionRecruitmentEntity {
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

  @Column({ type: 'varchar', name: 'map', nullable: true })
  map: string;

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

  @Column({ type: 'json', name: 'welfare', nullable: false })
  welfare: string[];

  @Column({ type: 'json', name: 'qualification', nullable: false })
  qualification: string[];

  @Column({ type: 'json', name: 'preference', nullable: false })
  preference: string[];

  @Column({ type: 'json', name: 'site', nullable: false })
  site: Record<string, string[]>;

  @Column({ type: 'text', name: 'description', nullable: true })
  description: string;

  @Column({ type: 'json', name: 'image', nullable: true })
  image: string[];

  @Column({ type: 'date', name: 'date', nullable: false })
  date: Date;
}
