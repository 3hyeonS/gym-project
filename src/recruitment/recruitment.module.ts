import { Module } from '@nestjs/common';
import { RecruitmentController } from './recruitment.controller';
import { RecruitmentService } from './recruitment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecruitmentEntity } from './entity/recruitment.entity';
import { CenterEntity } from 'src/auth/entity/center.entity';
import { RefreshTokenEntity } from 'src/auth/entity/refreshToken.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { KakaoStrategy } from 'src/auth/kakao.strategy';
import { EmailCodeEntity } from 'src/auth/entity/emailCode.entity';
import { BookmarkEntity } from './entity/bookmark.entity';
import { VillyEntity } from './entity/villy.entity';
import { CareerEntity } from 'src/auth/entity/resume/career.entity';
import { AcademyEntity } from 'src/auth/entity/resume/academy.entity';
import { QualificationEntity } from 'src/auth/entity/resume/qualification.entity';
import { UserEntity } from 'src/auth/entity/user/user.entity';
import { ResumeEntity } from 'src/auth/entity/resume/resume.entity';
import { VillySchedulerService } from './villy.scheduler.service';
import { NotionRecruitmentEntity } from './entity/notion-recruitment.entity';
import { FcmTokenEntity } from 'src/auth/entity/fcmToken.entity';
import { FirebaseService } from 'src/firebase.service';
import { CommunityReleaseNotificationEntity } from 'src/auth/entity/communityReleaseNotification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecruitmentEntity,
      CenterEntity,
      UserEntity,
      RefreshTokenEntity,
      EmailCodeEntity,
      BookmarkEntity,
      ResumeEntity,
      VillyEntity,
      CareerEntity,
      AcademyEntity,
      QualificationEntity,
      NotionRecruitmentEntity,
      FcmTokenEntity,
      CommunityReleaseNotificationEntity,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: process.env.JWT_EXPIRATION,
      },
    }),
    HttpModule,
  ],
  exports: [
    TypeOrmModule,
    PassportModule,
    JwtModule,
    RecruitmentService,
    VillySchedulerService,
    FirebaseService,
  ],
  controllers: [RecruitmentController],
  providers: [
    RecruitmentService,
    JwtStrategy,
    KakaoStrategy,
    VillySchedulerService,
    FirebaseService,
  ],
})
export class RecruitmentModule {}
