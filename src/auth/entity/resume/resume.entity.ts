import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CareerEntity } from './career.entity';
import { AcademyEntity } from './academy.entity';
import { QualificationEntity } from './qualification.entity';
import { UserEntity } from '../user/user.entity';
import { VillyEntity } from 'src/recruitment/entity/villy.entity';

@Entity({ name: 'resume' })
export class ResumeEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'profileImage', nullable: false })
  profileImage: string;

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
  license: number;

  @Column({ type: 'json', name: 'award', nullable: true })
  award: string[];

  @Column({ type: 'varchar', name: 'SNS', nullable: true })
  SNS: string;

  @Column({ type: 'varchar', name: 'portfolioFile', nullable: true })
  portfolioFile: string;

  @Column({ type: 'json', name: 'portfolioImages', nullable: true })
  portfolioImages: string[];

  @Column({ type: 'text', name: 'introduction', nullable: true })
  introduction: string;

  @Column({ type: 'tinyint', name: 'isSnapshot', nullable: false })
  isSnapshot: number;

  @CreateDateColumn({
    type: 'datetime',
    name: 'createdAt',
    nullable: false,
  })
  createdAt: Date;

  @OneToMany(() => CareerEntity, (career) => career.resume, {
    eager: true,
    nullable: true,
    cascade: true,
  })
  careers: CareerEntity[];

  @OneToOne(() => AcademyEntity, (academy) => academy.resume, {
    eager: true,
    nullable: true,
    cascade: true,
  })
  academy: AcademyEntity;

  @OneToMany(
    () => QualificationEntity,
    (qualification) => qualification.resume,
    {
      eager: true,
      nullable: true,
      cascade: true,
    },
  )
  qualifications: QualificationEntity[];

  @ManyToOne(() => UserEntity, (user) => user.resumes, {
    eager: true,
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @OneToMany(() => VillyEntity, (villy) => villy.resume, {
    nullable: true,
    cascade: true,
  })
  villies: VillyEntity[];
}
