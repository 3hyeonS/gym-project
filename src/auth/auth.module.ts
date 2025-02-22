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
import { GymEntity } from 'src/gyms/entity/gyms.entity';
import { EmailService } from './email.service';
import { ExpiredGymEntity } from 'src/gyms/entity/expiredGyms.entity';
import { EmailCodeEntity } from './entity/emailCode.entity';
import { JwtModule } from '@nestjs/jwt';
import { Gym2Entity } from 'src/gyms/entity/gyms2.entity';

// .env 파일 로드
dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      CenterEntity,
      RefreshTokenEntity,
      GymEntity,
      Gym2Entity,
      ExpiredGymEntity,
      EmailCodeEntity,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule,
    HttpModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, KakaoStrategy, EmailService],
  exports: [AuthService, AuthModule, JwtModule, PassportModule],
})
export class AuthModule {}
