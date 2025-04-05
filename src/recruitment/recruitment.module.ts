import { Module } from '@nestjs/common';
import { RecruitmentController } from './recruitment.controller';
import { RecruitmentService } from './recruitment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecruitmentEntity } from './entity/recruitment.entity';
import { CenterEntity } from 'src/auth/entity/center.entity';
import { UserEntity } from 'src/auth/entity/user.entity';
import { RefreshTokenEntity } from 'src/auth/entity/refreshToken.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { KakaoStrategy } from 'src/auth/kakao.strategy';
import { AuthModule } from 'src/auth/auth.module';
import { ExpiredRecruitmentEntity } from './entity/expiredRecruitment.entity';
import { EmailCodeEntity } from 'src/auth/entity/emailCode.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RecruitmentEntity,
      CenterEntity,
      UserEntity,
      RefreshTokenEntity,
      ExpiredRecruitmentEntity,
      EmailCodeEntity,
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
  exports: [TypeOrmModule, PassportModule, JwtModule, RecruitmentService],
  controllers: [RecruitmentController],
  providers: [RecruitmentService, JwtStrategy, KakaoStrategy],
})
export class RecruitmentModule {}
