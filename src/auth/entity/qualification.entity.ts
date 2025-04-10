import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ResumeEntity } from './resume.entity';

@Entity({ name: 'qualification' })
export class QualificationEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'certificate', nullable: false })
  certificate: string;

  @Column({ type: 'varchar', name: 'level', nullable: false })
  level: string;

  @ManyToOne(() => ResumeEntity, (resume) => resume.qualifications, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  resume: ResumeEntity;
}
