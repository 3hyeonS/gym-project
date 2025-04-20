import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BookmarkEntity } from 'src/recruitment/entity/bookmark.entity';
import { VillyEntity } from 'src/recruitment/entity/villy.entity';
import { SignWithEntity } from './signWith.entity';
import { KakaoKeyEntity } from './kakaoKey.entity';
import { AppleKeyEntity } from './appleKey.entity';
import { AuthorityEntity } from '../authority.entity';
import { RefreshTokenEntity } from '../refreshToken.entity';
import { ResumeEntity } from '../resume/resume.entity';
import { FcmTokenEntity } from '../fcmToken.entity';
import { CommunityReleaseNotificationEntity } from '../communityReleaseNotification.entity';

@Entity({ name: 'user' })
export class UserEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'nickname', nullable: false })
  nickname: string;

  @Column({ type: 'varchar', name: 'email', nullable: false })
  email: string;

  @ManyToOne(() => SignWithEntity, (signWith) => signWith.platform, {
    eager: true,
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  signWith: SignWithEntity;

  @OneToOne(() => KakaoKeyEntity, (kakaoKey) => kakaoKey.user, {
    eager: true,
    cascade: true,
    nullable: true,
  })
  kakaoKey: KakaoKeyEntity;

  @OneToOne(() => AppleKeyEntity, (appleKey) => appleKey.user, {
    eager: true,
    cascade: true,
    nullable: true,
  })
  appleKey: AppleKeyEntity;

  @ManyToOne(() => AuthorityEntity, (authority) => authority.role, {
    eager: true,
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  authority: AuthorityEntity;

  @OneToMany(() => BookmarkEntity, (bookmark) => bookmark.user, {
    nullable: true,
    cascade: true,
  })
  bookmarks: BookmarkEntity[];

  @OneToMany(() => RefreshTokenEntity, (refreshToken) => refreshToken.user, {
    nullable: true,
    cascade: true,
  })
  refreshTokens: RefreshTokenEntity[];

  @OneToOne(() => ResumeEntity, (resume) => resume.user, {
    eager: true,
    cascade: true,
    nullable: true,
  })
  resume: ResumeEntity;

  @OneToOne(() => FcmTokenEntity, (fcmToken) => fcmToken.user, {
    eager: true,
    cascade: true,
    nullable: true,
  })
  fcmToken: FcmTokenEntity;

  @OneToOne(
    () => CommunityReleaseNotificationEntity,
    (communityReleaseNotification) => communityReleaseNotification.user,
    {
      eager: true,
      cascade: true,
      nullable: true,
    },
  )
  communityReleaseNotification: CommunityReleaseNotificationEntity;

  @OneToMany(() => VillyEntity, (villy) => villy.user, {
    nullable: true,
    cascade: true,
  })
  villies: VillyEntity[];
}
