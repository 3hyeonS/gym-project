import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RecruitmentEntity } from './recruitment.entity';
import { ResumeEntity } from 'src/auth/entity/resume/resume.entity';

@Entity({ name: 'villy' })
export class VillyEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'tinyint', name: 'messageType', nullable: true })
  messageType: number;

  @ManyToOne(() => ResumeEntity, (resume) => resume.villies, {
    eager: true,
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  resume: ResumeEntity;

  @ManyToOne(() => RecruitmentEntity, (recruitment) => recruitment.villies, {
    eager: true,
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  recruitment: RecruitmentEntity;

  @CreateDateColumn({
    type: 'datetime',
    name: 'createdAt',
    nullable: false,
  })
  createdAt: Date;
}
