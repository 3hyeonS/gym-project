import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
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
import { KakaoKeyEntity } from './entity/kakaoKey.entity';
import { AppleKeyEntity } from './entity/appleKey.entity';
import { SignWithEntity } from './entity/signWith.entity';
import { RecruitmentModule } from 'src/recruitment/recruitment.module';
import { BookmarkEntity } from 'src/recruitment/entity/bookmark.entity';
import { ResumeEntity } from './entity/resume.entity';
import { CareerEntity } from './entity/career.entity';
import { AcademyEntity } from './entity/academy.entity';
import { QualificationEntity } from './entity/qualification.entity';
import { VillyEntity } from 'src/recruitment/entity/villy.entity';

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
  ],
  exports: [AuthService, AuthModule, JwtModule, PassportModule],
})
export class AuthModule {}
