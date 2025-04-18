import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ResumeEntity } from './resume.entity';

@Entity({ name: 'academy' })
export class AcademyEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'level', nullable: false })
  level: string;

  @Column({ type: 'varchar', name: 'status', nullable: false })
  status: string;

  @Column({ type: 'varchar', name: 'detail', nullable: false })
  detail: string;

  @OneToOne(() => ResumeEntity, (resume) => resume.academy, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'resumeId' })
  resume: ResumeEntity;
}
