import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { RecruitmentEntity } from './recruitment.entity';
import { UserEntity } from 'src/auth/entity/user/user.entity';

@Entity({ name: 'bookmark' })
export class BookmarkEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.bookmarks, {
    eager: true,
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @ManyToOne(() => RecruitmentEntity, (recruitment) => recruitment.bookmarks, {
    eager: true,
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  recruitment: RecruitmentEntity;
}
