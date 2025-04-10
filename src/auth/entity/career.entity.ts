import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ResumeEntity } from './resume.entity';

@Entity({ name: 'career' })
export class CareerEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'where', nullable: false })
  where: string;

  @Column({ type: 'date', name: 'start', nullable: false })
  start: Date;

  @Column({ type: 'date', name: 'end', nullable: false })
  end: Date;

  @ManyToOne(() => ResumeEntity, (resume) => resume.careers, {
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  resume: ResumeEntity;
}
