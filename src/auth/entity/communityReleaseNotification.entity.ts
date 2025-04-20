import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { CenterEntity } from './center.entity';
import { UserEntity } from './user/user.entity';

@Entity('communityReleaseNotification')
export class CommunityReleaseNotificationEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @CreateDateColumn({
    type: 'datetime',
    name: 'createdAt',
    nullable: false,
  })
  createdAt: Date;

  @OneToOne(() => UserEntity, (user) => user.communityReleaseNotification, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @OneToOne(
    () => CenterEntity,
    (center) => center.communityReleaseNotification,
    {
      nullable: true,
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'centerId' })
  center: CenterEntity;
}
