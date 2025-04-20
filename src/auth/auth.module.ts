import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import * as dotenv from 'dotenv';
import { KakaoStrategy } from './kakao.strategy';
import { HttpModule } from '@nestjs/axios';
import { CenterEntity } from './entity/center.entity';
import { RefreshTokenEntity } from './entity/refreshToken.entity';
import { RecruitmentEntity } from 'src/recruitment/entity/recruitment.entity';
import { EmailService } from './email.service';
import { EmailCodeEntity } from './entity/emailCode.entity';
import { JwtModule } from '@nestjs/jwt';
import { AppleStrategy } from './apple.strategy';
import { AuthorityEntity } from './entity/authority.entity';
import { KakaoKeyEntity } from './entity/user/kakaoKey.entity';
import { AppleKeyEntity } from './entity/user/appleKey.entity';
import { SignWithEntity } from './entity/user/signWith.entity';
import { RecruitmentModule } from 'src/recruitment/recruitment.module';
import { BookmarkEntity } from 'src/recruitment/entity/bookmark.entity';
import { CareerEntity } from './entity/resume/career.entity';
import { AcademyEntity } from './entity/resume/academy.entity';
import { QualificationEntity } from './entity/resume/qualification.entity';
import { VillyEntity } from 'src/recruitment/entity/villy.entity';
import { RecruitmentService } from 'src/recruitment/recruitment.service';
import { UserEntity } from './entity/user/user.entity';
import { ResumeEntity } from './entity/resume/resume.entity';
import { FcmTokenEntity } from './entity/fcmToken.entity';
import { FirebaseService } from 'src/firebase.service';
import { CommunityReleaseNotificationEntity } from './entity/communityReleaseNotification.entity';

// .env 파일 로드
dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      CenterEntity,
      AuthorityEntity,
      KakaoKeyEntity,
      AppleKeyEntity,
      SignWithEntity,
      RefreshTokenEntity,
      RecruitmentEntity,
      EmailCodeEntity,
      BookmarkEntity,
      ResumeEntity,
      CareerEntity,
      AcademyEntity,
      QualificationEntity,
      BookmarkEntity,
      VillyEntity,
      FcmTokenEntity,
      CommunityReleaseNotificationEntity,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule,
    HttpModule,
    RecruitmentModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    AppleStrategy,
    KakaoStrategy,
    EmailService,
    RecruitmentService,
    FirebaseService,
  ],
  exports: [
    AuthService,
    AuthModule,
    JwtModule,
    PassportModule,
    FirebaseService,
  ],
})
export class AuthModule {}
